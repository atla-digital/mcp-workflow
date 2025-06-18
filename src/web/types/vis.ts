// vis.js type declarations for TypeScript

declare global {
  namespace vis {
    interface NetworkOptions {
      nodes?: any;
      edges?: any;
      layout?: any;
      physics?: any;
      interaction?: any;
      manipulation?: any;
    }

    interface Node {
      id: string | number;
      label?: string;
      title?: string;
      color?: {
        background?: string;
        border?: string;
        highlight?: {
          background?: string;
          border?: string;
        };
      };
      shape?: string;
      font?: {
        color?: string;
        size?: number;
        face?: string;
      };
    }

    interface Edge {
      id?: string | number;
      from: string | number;
      to: string | number;
      arrows?: string | {
        to?: boolean | {
          enabled?: boolean;
          scaleFactor?: number;
        };
        from?: boolean | {
          enabled?: boolean;
          scaleFactor?: number;
        };
      };
      color?: {
        color?: string;
        highlight?: string;
        opacity?: number;
      };
    }

    interface DataSet<T> {
      add(data: T | T[]): void;
      update(data: T | T[]): void;
      remove(id: string | number | string[] | number[]): void;
      clear(): void;
      get(): T[];
      get(id: string | number): T | null;
    }

    interface Network {
      constructor(
        container: HTMLElement,
        data: { nodes: DataSet<Node> | Node[]; edges: DataSet<Edge> | Edge[] },
        options?: NetworkOptions
      ): Network;
      
      destroy(): void;
      setData(data: { nodes: DataSet<Node> | Node[]; edges: DataSet<Edge> | Edge[] }): void;
      setOptions(options: NetworkOptions): void;
      fit(): void;
      redraw(): void;
      
      on(event: string, callback: Function): void;
      off(event: string, callback: Function): void;
    }

    const DataSet: {
      new <T>(data?: T[]): DataSet<T>;
    };

    const Network: {
      new (
        container: HTMLElement,
        data: { nodes: DataSet<Node> | Node[]; edges: DataSet<Edge> | Edge[] },
        options?: NetworkOptions
      ): Network;
    };
  }
}

export {};