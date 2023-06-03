// 实现一个节点中bucket的节点增删改查
// 实现多个节点之间的查找

/* 
a. 学⽣需要实现Kademlia DHT中的K_Bucket数据结构，包括桶（Bucket）、节点（Node）等相
关数据结构 。
b. 学⽣应能够正确处理节点的插⼊、删除和更新等操作，根据节点ID将其分配到正确的桶中。
 */

/* 
1. K_Bucket算法实现：
a. 学⽣需要实现Kademlia DHT中的K_Bucket数据结构，包括桶（Bucket）、节点（Node）等相
关数据结构 。
b. 学⽣应能够正确处理节点的插⼊、删除和更新等操作，根据节点ID将其分配到正确的桶中。

2. 接⼝实现：
需要为K_Bucket结构提供两个接⼝：
◦ insertNode(nodeId string)：将给定的NodeId插⼊到正确的桶中。
◦ printBucketContents()：打印每个桶中存在的NodeID 
*/
class NodeT {
  id: string;
  timestamp: number;
  constructor(id: string, timestamp: number) {
    this.id = id;
    this.timestamp = timestamp;
  }
}
// const A = new NodeT("02",1);
class Bucket {
  private k: number;
  private nodes: Array<NodeT>;

  constructor(k: number) {
    this.k = k;
    this.nodes = [];
  }

  get length(): number {
    return this.nodes.length;
  }

  contains(nodeId: string): boolean {
    return this.nodes.some((node) => node.id === nodeId);
  }

  insertNode(node: NodeT): void {
    const nodeIndex = this.nodes.findIndex((n) => n.id === node.id);
    if (nodeIndex >= 0) {
      // update existing node's timestamp
      this.nodes[nodeIndex].timestamp = node.timestamp;
    } else {
      if (this.nodes.length < this.k) {
        // bucket is not yet full
        this.nodes.push(node);
      } else {
        // bucket is full, evict the oldest node
        this.nodes.sort((a, b) => a.timestamp - b.timestamp);
        this.nodes.shift();
        this.nodes.push(node);
      }
    }
  }

  deleteNode(nodeId: string): void {
    const nodeIndex = this.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex >= 0) {
      this.nodes.splice(nodeIndex, 1);
    }
  }

  printBucketContents(): void {
    console.log(this.nodes.map((node) => node.id));
  }
}

class K_Bucket {
  private buckets: Array<Bucket>;
  private k: number;

  constructor(k: number, numBuckets: number) {
    this.k = k;
    this.buckets = [];
    for (let i = 0; i < numBuckets; i++) {
      this.buckets.push(new Bucket(k));
    }
  }

  private getBucketIndex(nodeId: string): number {
    let prefixLength = 0;
    while (
      prefixLength < nodeId.length &&
      nodeId[prefixLength] === this.buckets[0][0]
    ) {
      prefixLength++;
    }
    if (prefixLength === nodeId.length) {
      // nodeId is the same as the local node's id
      return 0;
    } else {
      // find the first bit that differs between nodeId and the local node's id
      const differingBit =
        parseInt(this.buckets[0][prefixLength], 16) ^
        parseInt(nodeId[prefixLength], 16);
      return Math.floor(Math.log2(differingBit));
    }
  }

  insertNode(node: NodeT): void {
    const bucketIndex = this.getBucketIndex(node.id);
    this.buckets[bucketIndex].insertNode(node);
  }

  deleteNode(nodeId: string): void {
    const bucketIndex = this.getBucketIndex(nodeId);
    this.buckets[bucketIndex].deleteNode(nodeId);
  }

  printBucketContents(): void {
    console.log("Bucket contents:");
    for (let i = 0; i < this.buckets.length; i++) {
      console.log(`Bucket #${i}:`);
      this.buckets[i].printBucketContents();
    }
  }
}

const kBucket = new K_Bucket(3, 5);
// 不同的传参方式
kBucket.insertNode(new NodeT("02", 1));
kBucket.insertNode({ id: "05", timestamp: 2 });
kBucket.insertNode({ id: "06", timestamp: 3 });
kBucket.insertNode({ id: "03", timestamp: 4 });

console.log("After node insertion:");
kBucket.printBucketContents();

kBucket.deleteNode("06");

console.log("After node deletion:");
kBucket.printBucketContents();
