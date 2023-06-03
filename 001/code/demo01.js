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
class NodeZ {
  constructor(nodeId) {
    this.nodeId = nodeId;
  }
}

class Bucket {
  constructor(maxCapacity) {
    this.nodes = [];
    this.maxCapacity = maxCapacity;
  }

  insertNode(node) {
    if (this.nodes.length < this.maxCapacity) {
      this.nodes.push(node);
    } else {
      // 桶已满，执行分裂操作
      const splitBucketIndex = this.splitBucket();
      const splitNode = this.nodes[0]; // 分裂节点选择第一个节点
      const splitNodeId = splitNode.nodeId;
      const newBucket = new Bucket(this.maxCapacity);
      newBucket.nodes = this.nodes.splice(0, Math.floor(this.maxCapacity / 2));
      if (splitBucketIndex < this.nodes.length) {
        // 分裂节点的前缀位为0
        const newNode = new NodeZ(""); // 创建一个空的NodeZ对象，nodeId暂时为空
        this.nodes.splice(splitBucketIndex, 0, newNode);
        newBucket.nodes.push(newNode); // 将新的桶插入到新的节点后面
        this.updateNodeIds(); // 更新原桶中节点的nodeId
      } else {
        // 分裂节点的前缀位为1
        const newNode = new NodeZ(""); // 创建一个空的NodeZ对象，nodeId暂时为空
        this.nodes.push(newNode); // 将新的节点添加到原桶末尾
        newBucket.nodes.push(newNode); // 将新的桶插入到新的节点后面
        this.updateNodeIds(); // 更新原桶中节点的nodeId
      }

      // 将分裂节点放入新的桶
      const splitNodeDistance = getDistance(
        splitNodeId,
        newBucket.nodes[0].nodeId
      );
      if (splitNodeDistance === splitBucketIndex) {
        newBucket.nodes.push(splitNode);
      }
      // 重新分配原桶内的节点
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const distance = getDistance(
          node.nodeId,
          newBucket.nodes[0].nodeId
        );
        if (distance === splitBucketIndex) {
          newBucket.nodes.push(node);
        }
      }
    }
  }

  deleteNode(node) {
    const index = this.nodes.findIndex((n) => n.nodeId === node.nodeId);
    if (index !== -1) {
      this.nodes.splice(index, 1);
    }
  }

  splitBucket() {
    const prefixLength = Math.floor(Math.log2(this.nodes.length));
    return Math.pow(2, prefixLength);
  }

  updateNodeIds() {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node instanceof NodeZ) {
        node.nodeId = calculateNodeId(i);
      }
    }
  }
}

class K_Bucket {
  constructor(bucketSize) {
    this.buckets = [new Bucket(Math.pow(2, 160))];
    this.bucketSize = bucketSize;
  }

  insertNode(nodeId) {
    const bucket = this.findBucket(nodeId);
    const newNode = new NodeZ(nodeId);
    const newBucket = new Bucket(this.bucketSize);
    newBucket.insertNode(newNode);
    this.buckets.push(newBucket);
  }

  findBucket(nodeId) {
    // 找到节点ID所在的桶
    const distance = getDistance(nodeId, this.buckets[0].nodes[0].nodeId);
    const bucketIndex = Math.floor(Math.log2(distance));
    return this.buckets[bucketIndex];
  }

  printBucketContents() {
    for (const bucket of this.buckets) {
      for (const node of bucket.nodes) {
        console.log(node.nodeId);
      }
    }
  }
}

function getDistance(nodeId1, nodeId2) {
  // 计算节点之间的距离，可以使用 XOR 运算
  // 将节点ID转换为二进制字符串
  const binaryNodeId1 = hexToBinary(nodeId1);
  const binaryNodeId2 = hexToBinary(nodeId2);
  // 计算 XOR 运算结果
  let distance = "";
  for (let i = 0; i < binaryNodeId1.length; i++) {
    if (binaryNodeId1.charAt(i) === binaryNodeId2.charAt(i)) {
      distance += "0";
    } else {
      distance += "1";
    }
  }
  // 将二进制字符串转换为十进制数值
  return parseInt(distance, 2);
}

function hexToBinary(hex) {
  let binary = "";
  for (let i = 0; i < hex.length; i++) {
    const value = parseInt(hex.charAt(i), 16);
    binary += value.toString(2).padStart(4, "0");
  }
  return binary;
}

function calculateNodeId(bucketIndex) {
  // 根据桶索引计算节点ID
  return bucketIndex.toString(16);
}

//测试：

//插入节点：
const kBucket = new K_Bucket(3);
kBucket.buckets[0].insertNode(new NodeZ("node0"));
kBucket.insertNode("node1");
kBucket.insertNode("node2");
kBucket.insertNode("node3");
kBucket.insertNode("node4");
kBucket.insertNode("node5");
console.log("---Bucket Contents:---");
kBucket.printBucketContents();

// 插入相同的节点多次：
const kBucket2 = new K_Bucket(3);
kBucket2.buckets[0].insertNode(new NodeZ("node0"));
kBucket2.insertNode("node1");
kBucket2.insertNode("node1");
kBucket2.insertNode("node1");
console.log("---Bucket Contents:---");
kBucket2.printBucketContents();

// 删除节点：
const kBucket3 = new K_Bucket(3);
kBucket3.buckets[0].insertNode(new NodeZ("node0"));
kBucket3.insertNode("node1");
kBucket3.insertNode("node2");
kBucket3.insertNode("node3");

console.log("---删除前Bucket Contents:---");
kBucket3.printBucketContents();

const nodeToDelete = new NodeZ("node3");
kBucket3.buckets[1].deleteNode(nodeToDelete);

console.log("---删除后Bucket Contents:---");
kBucket3.printBucketContents();
