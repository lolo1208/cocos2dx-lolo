namespace lolo {


    /**
     * 双向链表的节点
     * @author LOLO
     */
    export interface LinkedListNode {
        /**该节点的key*/
        key: any;
        /**该节点的值*/
        value: any;
        /**上一个节点。表头节点的上一个节点始终为null*/
        prev: LinkedListNode;
        /**下一个节点。表尾节点的下一个节点始终为null*/
        next: LinkedListNode;
    }


    /**
     * 双向链表
     * @author LOLO
     */
    export class LinkedList {
        /**数据列表*/
        private _list: lolo.Dictionary;
        /**表头节点*/
        private _head: LinkedListNode;
        /**表尾节点*/
        private _tail: LinkedListNode;


        /**
         * 构造函数
         */
        public constructor() {
            this._list = new lolo.Dictionary();
        }


        /**
         * 根据键值创建节点，并将该节点添加到表头
         * @param value
         * @param key
         * @return 新添加的节点
         */
        public unshift(value: any, key: any): LinkedListNode {
            let node: LinkedListNode = {
                key: key, value: value, prev: null, next: this._head
            };

            if (this._tail == null) this._tail = node;
            if (this._head == null) this._head = node;
            else this._head.prev = node;

            this._head = node;
            this._list.setItem(key, node);
            return node;
        }


        /**
         * 根据键值创建节点，并将该节点添加到表尾
         * @param value
         * @param key
         * @return 新创建的节点
         */
        public push(value: any, key: any): LinkedListNode {
            let node: LinkedListNode = {
                key: key, value: value, prev: this._tail, next: null
            };

            if (this._head == null) this._head = node;
            if (this._tail == null) this._tail = node;
            else this._tail.next = node;

            this._tail = node;
            this._list.setItem(key, node);
            return node;
        }


        /**
         * 将 key 对应的节点移动到表头
         * @param key
         */
        public moveToHead(key: any): void {
            let node: LinkedListNode = this._list.getItem(key);
            if (node == null || node == this._head) return;

            if (node.prev != null) node.prev.next = node.next;
            if (node.next != null) node.next.prev = node.prev;

            if (node == this._tail) this._tail = node.prev;

            node.prev = null;
            node.next = this._head;

            if (this._head != null) this._head.prev = node;
            this._head = node;
        }


        /**
         * 将 key 对应的节点移动到表尾
         * @param key
         */
        public moveToTail(key: any): void {
            let node: LinkedListNode = this._list.getItem(key);
            if (node == null || node == this._tail) return;

            if (node.prev != null) node.prev.next = node.next;
            if (node.next != null) node.next.prev = node.prev;

            if (node == this._head) this._head = node.next;

            node.next = null;
            node.prev = this._tail;

            if (this._tail != null) this._tail.next = node;
            this._tail = node;
        }


        /**
         * 在 prevKey 对应的节点之后插入新的节点
         * @param prevKey
         * @param key
         * @param value
         * @return 新创建的节点
         */
        public insertAfter(prevKey: any, key: any, value: any): LinkedListNode {
            let prev: LinkedListNode = this._list.getItem(prevKey);
            if (prev == null) return null;

            let node: LinkedListNode = {
                key: key, value: value, prev: prev, next: prev.next
            };
            prev.next = node;
            return node;
        }


        /**
         * 在 nextKey 对应的节点之前插入新的节点
         * @param nextKey
         * @param key
         * @param value
         * @return 新创建的节点
         */
        public insertBefore(nextKey: any, key: any, value: any): LinkedListNode {
            let next: LinkedListNode = this._list.getItem(nextKey);
            if (next == null) return null;

            let node: LinkedListNode = {
                key: key, value: value, prev: next.prev, next: next
            };
            next.prev = node;
            return node;
        }


        /**
         * 移除 key 对应的节点
         * @param key
         * @return 已被移除的节点
         */
        public remove(key: any): LinkedListNode {
            let node: LinkedListNode = this._list.getItem(key);
            if (node == null) return null;

            if (node.prev) node.prev.next = node.next;
            if (node.next) node.next.prev = node.prev;
            this._list.removeItem(key);

            if (node == this._head) this._head = node.next;
            if (node == this._tail) this._tail = node.prev;

            return node;
        }


        /**
         * 获取 key 对应的节点
         * @param key
         * @return
         */
        public getNode(key: any): LinkedListNode {
            return this._list.getItem(key);
        }


        /**
         * 获取 key 对应的 value
         * @param key
         * @return
         */
        public getValue(key: any): any {
            let node: LinkedListNode = this._list.getItem(key);
            if (node == null) return null;
            return node.value;
        }


        /**
         * 获取第一个节点（表头）
         * @return
         */
        public get head(): LinkedListNode {
            return this._head;
        }


        /**
         * 获取最后一个节点（表尾）
         * @return
         */
        public get tail(): LinkedListNode {
            return this._tail;
        }


        /**
         * 链表中是否包含 key 对应的节点
         * @param key
         * @return
         */
        public contains(key: any): boolean {
            return this._list.hasItem(key);
        }


        /**
         * 是否为空链表，链表中是否没有数据
         * @return {boolean}
         */
        public isEmpty(): boolean {
            return this._head == null;
        }


        /**
         * 清除
         */
        public clean(): void {
            this._list.clean();
            this._head = null;
            this._tail = null;
        }

        //
    }
}