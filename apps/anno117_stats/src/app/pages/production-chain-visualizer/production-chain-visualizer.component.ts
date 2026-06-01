import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  computed,
} from '@angular/core';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
  MatSelectTrigger,
} from '@angular/material/select';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';

import {
  ProductionChainService,
  ProductionChainViewModel,
  BuildingNodeJSON,
} from '../../services/production-chain.service';

interface SelectedNodeDetails {
  guid: number;
  text: string;
  stdName: string;
  iconUrl: string;
  level: number;
}

interface GraphNode {
  id: number;
  label: string;
  image: string;
  level: number;
}

interface GraphEdge {
  id: string;
  from: number;
  to: number;
}

@Component({
  selector: 'anno-production-chain-visualizer',
  standalone: true,
  imports: [MatSelect, MatOption, MatSelectTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './production-chain-visualizer.component.html',
  styleUrl: './production-chain-visualizer.component.scss',
})
export class ProductionChainVisualizer
  implements OnInit, AfterViewInit, OnDestroy
{
  readonly service = inject(ProductionChainService);

  visContainer = viewChild<ElementRef<HTMLDivElement>>('visContainer');

  // Localized visualizer customizer states
  primaryColor = signal<string>('');
  secondaryColor = signal<string>('');
  bgColor = signal<string>('');

  // Styles.scss typography hook
  fontPrimary = signal<string>('serif');

  selectedChain = signal<ProductionChainViewModel | null>(null);
  selectedNode = signal<SelectedNodeDetails | null>(null);

  private networkInstance: Network | null = null;
  private readonly nodeMetadataMap = new Map<number, SelectedNodeDetails>();

  // 1. Keep an uninitialized tracking token state initially
  activeChainId = signal<string>('');

  // chains = this.service.chains

  /**
   * Groups chains by region classification: Exclusively Roman, Exclusively Celtic, or Both.
   * Deduplicates entries by chain name to prevent redundant selection options.
   */
  groupedChains = computed(() => {
    const rawChains = this.service.chains();

    const romanChains: ProductionChainViewModel[] = [];
    const celticChains: ProductionChainViewModel[] = [];
    const sharedChains: ProductionChainViewModel[] = [];

    // 1. Distribute chains into their respective regional buckets based on root building assignment
    rawChains.forEach((chain) => {
      const rootBuilding = chain.outputBuilding;
      if (!rootBuilding) return;

      const regions = rootBuilding.region || [];
      const hasRoman = regions.includes('Roman');
      const hasCeltic = regions.includes('Celtic');

      if (hasRoman && hasCeltic) {
        sharedChains.push(chain);
      } else if (hasRoman) {
        romanChains.push(chain);
      } else if (hasCeltic) {
        celticChains.push(chain);
      }
    });

    // 2. Local helper to prune duplicate chain names within each group and sort alphabetically
    const processGroup = (chains: ProductionChainViewModel[]) => {
      const seenNames = new Set<string>();
      return chains
        .filter((chain) => {
          if (seenNames.has(chain.name)) {
            return false; // Skip duplicate names localized within this specific category
          }
          seenNames.add(chain.name);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    };
    return [
      {
        label: 'Latium',
        icon: 'assets/icons/main/regions/icon_2d_region_heartlands_0.webp',
        chains: processGroup(romanChains),
      },
      {
        label: 'Albion',
        icon: 'assets/icons/main/regions/icon_2d_region_wetlands_0.webp',
        chains: processGroup(celticChains),
      },
      {
        label: 'Shared',
        icon: 'assets/icons/main/regions/icon_2d_region_global_0.webp',
        chains: processGroup(sharedChains),
      },
    ].filter((group) => group.chains.length > 0);
  });

  constructor() {
    // Rebuilds graph layout whenever structural options or colors shift
    effect(() => {
      const primary = this.primaryColor();
      const secondary = this.secondaryColor();
      const bg = this.bgColor();
      const chain = this.selectedChain();

      if (primary && secondary && bg && chain) {
        this.rebuildGraph();
      }
    });

    // FIX: Intercepts the asynchronous chain payload arriving from the backend modding database
    effect(() => {
      const loadedChains = this.service.chains();

      if (loadedChains.length > 0 && !this.selectedChain()) {
        const defaultId = '3222'; // Default Timber GUID

        // Find the chain matching starting ID
        const defaultChain =
          loadedChains.find((c) => c.id === defaultId) || loadedChains[0];

        if (defaultChain) {
          this.activeChainId.set(defaultChain.id);
          this.selectedChain.set(defaultChain);
        }
      }
    });
  }

  ngOnInit(): void {
    const rootStyles = getComputedStyle(document.documentElement);

    // Seed signals with global stylesheet design token values initial states
    this.primaryColor.set(
      rootStyles.getPropertyValue('--primary-color').trim(),
    );
    this.secondaryColor.set(
      rootStyles.getPropertyValue('--secondary-color').trim(),
    );
    this.bgColor.set(
      rootStyles.getPropertyValue('--background-accent-color').trim() ||
        rootStyles.getPropertyValue('--background-color').trim(),
    );
    this.fontPrimary.set(
      rootStyles.getPropertyValue('--font-primary').trim() ||
        'Marcellus, Roboto, serif',
    );

    this.service.fetchChains('en');
  }

  ngAfterViewInit(): void {
    if (this.primaryColor()) {
      this.rebuildGraph();
    }
  }

  ngOnDestroy(): void {
    if (this.networkInstance) {
      this.networkInstance.destroy();
      this.networkInstance = null;
    }
  }

  private rebuildGraph(): void {
    const container = this.visContainer()?.nativeElement;
    const chain = this.selectedChain();
    if (!container || !chain) return;

    const rawNodes: GraphNode[] = [];
    const rawEdges: GraphEdge[] = [];
    this.nodeMetadataMap.clear();

    const parseNodes = (node: BuildingNodeJSON, level: number): void => {
      this.nodeMetadataMap.set(node.guid, {
        guid: node.guid,
        text: node.text,
        stdName: node.std_name,
        iconUrl: node.icon_url,
        level: level,
      });

      rawNodes.push({
        id: node.guid,
        label: node.text,
        image: node.icon_url || this.service.placeholderImage,
        level: level,
      });

      node.tier.forEach((child) => {
        rawEdges.push({
          id: `${child.guid}-${node.guid}`,
          from: child.guid,
          to: node.guid,
        });
        parseNodes(child, level + 1);
      });
    };
    parseNodes(chain.outputBuilding, 0);

    const uniqueNodes = Array.from(
      new Map(rawNodes.map((item) => [item.id, item])).values(),
    );

    const nodesDataSet = new DataSet<GraphNode>(uniqueNodes);
    const edgesDataSet = new DataSet<GraphEdge>(rawEdges);

    const options: Options = {
      nodes: {
        shape: 'circularImage',
        imagePadding: 4,
        size: 38,
        borderWidth: 2.5,
        borderWidthSelected: 3.5,
        color: {
          border: this.secondaryColor(),
          background: this.primaryColor(),
          highlight: {
            border: this.secondaryColor(),
            background: this.primaryColor(),
          },
        },
        font: {
          color: this.secondaryColor(),
          size: 14,
          face: this.fontPrimary(),
          strokeWidth: 0,
          strokeColor: 'none',
          vadjust: 24,
        },
      },
      edges: {
        font: {
          strokeWidth: 0,
          strokeColor: 'none',
        },
        width: 2.2,
        color: {
          color: this.secondaryColor(),
          highlight: this.secondaryColor(),
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1.1,
            type: 'arrow',
          },
        },
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          roundness: 0.5,
        },
      },
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'RL',
          sortMethod: 'directed',
          nodeSpacing: 160,
          levelSeparation: 250,
        },
      },
      interaction: {
        dragView: false,
        zoomView: false,
        hover: true,
        dragNodes: true,
        selectable: true,
      },
      physics: {
        enabled: false,
      },
    };

    if (this.networkInstance) {
      this.networkInstance.destroy();
    }

    this.networkInstance = new Network(
      container,
      { nodes: nodesDataSet, edges: edgesDataSet },
      options,
    );

    this.networkInstance.on(
      'click',
      (params: { nodes: (string | number)[] }) => {
        if (params.nodes.length > 0) {
          const selectedGuid = Number(params.nodes[0]);
          const meta = this.nodeMetadataMap.get(selectedGuid);
          if (meta) {
            this.selectedNode.set(meta);
          }
        } else {
          this.selectedNode.set(null);
        }
      },
    );
  }

  resetColors() {
    const rootStyles = getComputedStyle(document.documentElement);

    this.bgColor.set(
      rootStyles.getPropertyValue('--background-accent-color').trim() ||
        rootStyles.getPropertyValue('--background-color').trim(),
    );
    this.primaryColor.set(
      rootStyles.getPropertyValue('--primary-color').trim(),
    );
    this.secondaryColor.set(
      rootStyles.getPropertyValue('--secondary-color').trim(),
    );

    if (this.networkInstance) {
      this.networkInstance.setOptions({
        nodes: {
          color: {
            background: this.primaryColor(),
            border: this.secondaryColor(),
            highlight: {
              background: this.primaryColor(),
              border: this.secondaryColor(),
            },
          },
          font: { color: this.secondaryColor() },
        },
        edges: {
          color: {
            color: this.secondaryColor(),
            highlight: this.secondaryColor(),
          },
        },
      });
    }
  }

  onChainChange(event: MatSelectChange): void {
    const nextId = event.value;

    if (nextId) {
      this.activeChainId.set(nextId);

      const targetChain = this.service.chains().find((c) => c.id === nextId);

      if (targetChain) {
        this.selectedChain.set(targetChain);
      }

      this.selectedNode.set(null);
      this.resetView();
    }
  }

  updateColor(type: 'bg' | 'primary' | 'secondary', event: Event): void {
    const input = event.target as HTMLInputElement;
    if (type === 'bg') this.bgColor.set(input.value);
    if (type === 'primary') this.primaryColor.set(input.value);
    if (type === 'secondary') this.secondaryColor.set(input.value);
  }

  handleIconFallback(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.service.placeholderImage;
  }

  resetView(): void {
    if (this.networkInstance) {
      this.networkInstance.fit();
    }
  }

  exportCanvas(): void {
    if (!this.networkInstance) return;
    const container = this.visContainer()?.nativeElement;
    const canvasElement = container?.querySelector(
      'canvas',
    ) as HTMLCanvasElement;
    if (canvasElement) {
      const dataUrl = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${this.selectedChain()?.canonName || 'production_chain'}.png`;
      link.href = dataUrl;
      link.click();
    }
  }
}
