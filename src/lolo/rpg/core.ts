namespace lolo.rpg {


    /**
     * 地图信息数据
     * @author LOLO
     */
    export interface MapInfo {
        /**地图的像素宽*/
        mapWidth: number;
        /**地图的像素高*/
        mapHeight: number;
        /**缩略图占正常图的缩放比例*/
        thumbnailScale: number;

        /**是否为交错排列的区块*/
        staggered: boolean;
        /**区块的像素宽*/
        tileWidth: number;
        /**区块的像素高*/
        tileHeight: number;
        /**水平方向区块的数量*/
        hTileCount: number;
        /**垂直方向区块的数量*/
        vTileCount: number;

        /**图块的像素宽*/
        chunkWidth: number;
        /**图块的像素高*/
        chunkHeight: number;
        /**水平方向图块的数量*/
        hChunkCount: number;
        /**垂直方向图块的数量*/
        vChunkCount: number;

        /**地图数据，二维数组 data[y][x] */
        data: {x: number, y: number, cover: boolean, canPass: boolean}[][];
        /**遮挡物列表 covers[{id:遮挡物的id, point:遮挡物的像素位置)}]*/
        covers: {id: string, point: {x: number, y: number}}[];
    }


    //


    /**
     * RPG地图寻路（AStar）
     * 根据传入的地图信息，查找出起点和重点间的最佳路径。
     * 如果无法到达终点，将返回[]。
     * 如果起点和终点相同，将返回[]
     * @param mapInfo 地图信息
     * @param startP 开始点
     * @param endP 结束点
     * @return
     */
    export function wayfinding(mapInfo: MapInfo, startP: Point, endP: Point): any[] {
        let mapData: any[] = mapInfo.data;
        if (startP.x == endP.x && startP.y == endP.y) return [];//结束点就是开始点
        if (!mapData[endP.y] || !mapData[endP.y][endP.x].canPass) return [];//结束点是不可通行的

        let isPathFind: boolean = false;//是否有找到可通行的路线
        let closeA: any[] = [];//关闭列表
        let findA: any[] = [];//完成列表（已经考察过的坐标点）
        let openA: any[] = [];//开放列表
        let walkA: any[] = null;//结果路径
        let x: number, y: number, i: number, n: number, j: number;

        //设置完成列表，标记可以考察的坐标点
        let yCount: number = mapData.length;
        let xCount: number = mapData[0].length;
        for (y = 0; y < yCount; y++) {
            findA[y] = [];
            for (x = 0; x < xCount; x++) {
                findA[y][x] = mapData[y][x].canPass ? 0 : 1;//高度大于0的点才可以考察
            }
        }

        //寻找附近的路径
        let initialized: boolean = false;
        let searchEnd: boolean = false;
        let nx: number = startP.x, ny: number = startP.y;//当前点
        let px: number = startP.x, py: number = startP.y;//目标点
        let g: number = 0;//总代价
        while (!searchEnd) {
            if (initialized) {
                //寻路还未完成，获取最小F值，继续寻路
                let min: number = 0;
                let len: number = openA.length;
                for (i = 0; i < len; i++) {
                    if (openA[min][4] > openA[i][4]) {
                        min = i;
                    }
                }
                let tCloseA: any[] = openA.splice(min, 1);
                nx = tCloseA[0][0];
                ny = tCloseA[0][1];
                px = tCloseA[0][2];
                py = tCloseA[0][3];
                g = tCloseA[0][5];
            }
            else {
                initialized = true;
            }

            let hval: number;//当前点到终点的代价值
            let gval: number;//起点到当前点的代价值

            findA[ny][nx] = 1;
            closeA.push([nx, ny, px, py]);

            let dir: any[];
            if (mapInfo.staggered)
                dir = (ny % 2 == 0) ? Constants.O_EVEN : Constants.O_ODD;
            else
                dir = Constants.O_RHO;

            //八方向寻路
            for (i = 1; i < 9; i++) {
                let adjX: number = nx + dir[i][0];//相邻节点x
                let adjY: number = ny + dir[i][1];

                //坐标点超出范围
                if (adjX < 0 || adjX >= findA.length || adjY < 0 || adjY >= findA.length) continue;

                //找到了终点，放入关闭列表
                if (adjX == endP.x && adjY == endP.y) {
                    closeA.push([adjX, adjY, nx, ny]);
                    searchEnd = isPathFind = true;
                    break;
                }

                //坐标点还未考察过
                if (findA[adjY][adjX] == 0) {
                    hval = dir[i][2];
                    gval = g + dir[i][2];
                    findA[adjY][adjX] = gval;//设置为G值
                    openA.push([adjX, adjY, nx, ny, gval + hval, gval]);
                }
                else if (findA[adjY][adjX] > 1) {
                    gval = g + dir[i][2];
                    if (gval < findA[adjY][adjX]) {
                        hval = 10 * (Math.abs(endP.x - adjX) + Math.abs(endP.y - adjY));
                        for (let k = 1; k < openA.length; k++) {
                            if (openA[k][0] == adjX && openA[k][1] == adjY) {
                                openA[k] = [adjX, adjY, nx, ny, gval + hval, gval];
                                findA[adjY][adjX] = gval;
                                break;
                            }
                        }
                    }
                }
            }

            //开放列表中已经没有路径可搜寻了
            if (!searchEnd && openA.length == 0) {
                searchEnd = true;//跳出 while 循环
            }
        }

        //找到可通行的路径了
        if (isPathFind) {
            i = closeA.length - 1;
            n = 0;
            walkA = [];
            walkA[0] = [];
            walkA[0][0] = closeA[i][0];
            walkA[0][1] = closeA[i][1];
            px = closeA[i][2];
            py = closeA[i][3];

            for (j = i - 1; j >= 0; j--) {
                if (px == closeA[j][0] && py == closeA[j][1]) {
                    n++;
                    walkA[n] = [];
                    walkA[n][0] = closeA[j][0];
                    walkA[n][1] = closeA[j][1];
                    px = closeA[j][2];
                    py = closeA[j][3];
                }
            }

            walkA.reverse();
        }

        return walkA;
    }


    /**
     * 获取指定 区块 的 中心点像素坐标
     * @param tile 区块坐标
     * @param mapInfo 地图信息
     * @return
     */
    export function getTileCenter(tile: Point, mapInfo: MapInfo): Point {
        if (mapInfo.staggered) {
            let p: Point = CachePool.getPoint();

            //算出目标区块的坐标
            let isEven: boolean = (tile.y % 2) == 0;//是否为偶数行
            p.x = tile.x * mapInfo.tileWidth;
            p.y = tile.y * mapInfo.tileHeight * 0.5;
            if (!isEven) p.x += mapInfo.tileWidth * 0.5;

            //加上半个区块宽高
            p.x += mapInfo.tileWidth * 0.5;
            p.y += mapInfo.tileHeight * 0.5;

            return p;
        }


        //找到(0,0)点位置
        let num: number = Math.round(mapInfo.mapWidth / mapInfo.tileWidth) - 1;
        let hw: number = mapInfo.tileWidth >> 1;
        let hh: number = mapInfo.tileHeight >> 1;
        let zx: number = hw * num;
        let zy: number = hh * num + mapInfo.mapHeight;

        //加上半个区块宽高（区块的中心点）
        zx += mapInfo.tileWidth >> 1;
        zy += mapInfo.tileHeight >> 1;

        return CachePool.getPoint(
            zx + (tile.x - tile.y) * hw,
            zy - (tile.x + tile.y) * hh
        );
    }


    /**
     * 获取指定 像素坐标 所对应的 区块坐标
     * @param pixel 像素坐标
     * @param mapInfo 地图信息
     * @return
     */
    export function getTile(pixel: Point, mapInfo: MapInfo): Point {
        if (mapInfo.staggered) {
            let x: number = pixel.x;
            let y: number = pixel.y;
            let tx: number = 0;
            let ty: number = 0;

            let cx: number, cy: number, rx: number, ry: number;
            cx = Math.floor(x / mapInfo.tileWidth) * mapInfo.tileWidth + mapInfo.tileWidth / 2;
            cy = Math.floor(y / mapInfo.tileHeight) * mapInfo.tileHeight + mapInfo.tileHeight / 2;

            rx = (x - cx) * mapInfo.tileHeight / 2;
            ry = (y - cy) * mapInfo.tileWidth / 2;

            if (Math.abs(rx) + Math.abs(ry) <= mapInfo.tileWidth * mapInfo.tileHeight / 4) {
                tx = Math.floor(x / mapInfo.tileWidth);
                ty = Math.floor(y / mapInfo.tileHeight) * 2;
            }
            else {
                x = x - mapInfo.tileWidth / 2;
                tx = Math.floor(x / mapInfo.tileWidth) + 1;
                y = y - mapInfo.tileHeight / 2;
                ty = Math.floor(y / mapInfo.tileHeight) * 2 + 1;
            }

            //无区块的区域，加上半个区块宽高，得到最近的区块
            if (tx > 99999 || ty > 99999) {
                pixel.x += mapInfo.tileWidth >> 1;
                pixel.y += mapInfo.tileHeight >> 1;
                return getTile(pixel, mapInfo);
            }

            return CachePool.getPoint(tx - (ty & 1), ty);
        }


        //找到(0,0)点位置
        let num: number = Math.round(mapInfo.mapWidth / mapInfo.tileWidth) - 1;
        let hw: number = mapInfo.tileWidth >> 1;
        let hh: number = mapInfo.tileHeight >> 1;
        let zx: number = hw * num;
        let zy: number = hh * num + mapInfo.mapHeight;

        //水平平移半个宽，垂直平移一个高
        zx += mapInfo.tileWidth >> 1;
        zy += mapInfo.tileHeight;

        //算出正确的偏移的像素
        pixel.x = zx - pixel.x;
        pixel.y = zy - pixel.y;

        return CachePool.getPoint(
            Math.abs(Math.floor(pixel.x / mapInfo.tileWidth - pixel.y / mapInfo.tileHeight)),
            Math.abs(Math.floor(pixel.x / mapInfo.tileWidth + pixel.y / mapInfo.tileHeight))
        );
    }


    /**
     * 获取指定方向的旁边点的坐标
     * @param t 区块位置
     * @param direction 方向
     * @param mapInfo
     * @return
     */
    export function getSideTile(t: Point, direction: number, mapInfo: MapInfo): Point {
        let oa: any[] = [];
        if (mapInfo.staggered)
            oa = (t.y % 2 == 0) ? Constants.O_EVEN : Constants.O_ODD;
        else
            oa = Constants.O_RHO;
        return CachePool.getPoint(t.x + oa[direction][0], t.y + oa[direction][1]);
    }


    /**
     * 指定的区块是否在地图数据范围内
     * @param tile
     * @param mapInfo
     * @return
     */
    export function tileInTheMapData(tile: Point, mapInfo: MapInfo): boolean {
        return (tile.x >= 0 && tile.x < mapInfo.data[0].length && tile.y >= 0 && tile.y < mapInfo.data.length);
    }


    /**
     * 获取指定方向的旁边点是否可以通行
     * @param p 区块位置
     * @param direction 要探测的方向
     * @param mapInfo 地图信息
     * @return
     */
    export function canPassSide(p: Point, direction: number, mapInfo: MapInfo): boolean {
        let pSide: Point = getSideTile(p, direction, mapInfo);//查找的点

        if (!tileInTheMapData(pSide, mapInfo)) return false;//超出范围

        return mapInfo.data[pSide.y][pSide.x].canPass;
    }


    /**
     * 获取p2在p1的什么角度（是像素点，不是区块点，方向正右→ angle=0）
     * @param p1
     * @param p2
     * @return
     */
    export function getAngle(p1: Point, p2: Point): number {
        //两点的x,y值，斜边
        let x: number = p2.x - p1.x;
        let y: number = p2.y - p1.y;
        let hypotenuse: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        //斜边长度，弧度
        let cos: number = x / hypotenuse;
        let radian: number = Math.acos(cos);

        //角度
        let angle: number = 180 / (Math.PI / radian);

        //用弧度算出角度
        if (y < 0) {
            angle = -angle;
        }
        else if (y == 0 && x < 0) {
            angle = 180;
        }

        return angle;
    }


    /**
     * 根据方向获取对应的角度（方向正右→ angle=0）
     * @param direction
     * @return
     */
    export function getAngleByDirection(direction: number): number {
        switch (direction) {
            case Constants.D_UP:
                return -90;
            case Constants.D_RIGHT_UP:
                return -45;
            case Constants.D_RIGHT:
                return 0;
            case Constants.D_RIGHT_DOWN:
                return 45;
            case Constants.D_DOWN:
                return 90;
            case Constants.D_LEFT_DOWN:
                return 135;
            case Constants.D_LEFT:
                return 180;
            case Constants.D_LEFT_UP:
                return -135;
        }
        return 0;
    }


    /**
     * 获取p2在p1的什么方向（是像素点，不是区块点，方向正右→ angle=0）
     * @param p1
     * @param p2
     * @return
     */
    export function getDirection(p1: Point, p2: Point): number {
        let angle: number = getAngle(p1, p2);
        if (angle <= -70 && angle > -110)    return Constants.D_UP;
        if (angle <= 110 && angle > 70)        return Constants.D_DOWN;
        if (angle <= -165 || angle > 165)    return Constants.D_LEFT;
        if (angle <= 15 && angle > -15)        return Constants.D_RIGHT;
        if (angle <= -110 && angle > -165)    return Constants.D_LEFT_UP;
        if (angle <= 165 && angle > 110)        return Constants.D_LEFT_DOWN;
        if (angle <= -15 && angle > -70)        return Constants.D_RIGHT_UP;
        return Constants.D_RIGHT_DOWN;
    }

    /**
     * 获取t2在t1的什么方向（<b>是区块点，不是像素点</b>）
     * @param t1
     * @param t2
     * @param mapInfo
     * @return 方向（见"RpgConstants.D_"系列常量）
     */
    export function getDirection2(t1: Point, t2: Point, mapInfo: MapInfo): number {
        let p1: Point = getTileCenter(t1, mapInfo);
        let p2: Point = getTileCenter(t2, mapInfo);
        let d: number = getDirection(p1, p2);
        CachePool.recycle([p1, p2]);
        return d;
    }


    /**
     * 指定的点是否可通行
     * @param p
     * @param mapInfo
     * @return
     */
    export function canPassTile(p: Point, mapInfo: MapInfo): boolean {
        return mapInfo.data[p.y] && mapInfo.data[p.y][p.x] && mapInfo.data[p.y][p.x].canPass;
    }


    /**
     * 获取一个离终点最近的可通行的点
     * @param p1 起点
     * @param p2 终点
     * @param mapInfo 地图信息
     * @return
     */
    export function closestCanPassTile(p1: Point, p2: Point, mapInfo: MapInfo): Point {
        //终点已经在起点旁边了
        if ((Math.abs(p2.x - p1.x) == 1 || p2.x == p1.x) && (Math.abs(p2.y - p1.y) == 1 || p2.y == p1.y)) {
            return p2;
        }

        //终点不能通行
        if (!canPassTile(p2, mapInfo)) {
            let d: number = getDirection(p2, p1);//起点在终点的什么方向
            let p: Point = getSideTile(p2, d, mapInfo);//取终点朝这个方向的点
            return closestCanPassTile(p1, p, mapInfo);//继续查找
        }

        return p2;
    }


    /**
     * 获取地图上随机的一个可通行的区块点
     * @param mapInfo
     * @return
     */
    export function getRandomCanPassTile(mapInfo: MapInfo): Point {
        let p: Point = CachePool.getPoint(
            Math.floor(mapInfo.data[0].length * Math.random()),
            Math.floor(mapInfo.data.length * Math.random())
        );
        if (mapInfo.data[p.y][p.x].canPass) return p;

        CachePool.recycle(p);
        return getRandomCanPassTile(mapInfo);
    }


    /**
     * 获取指定范围内所包含的所有区块列表
     * @param tile 起始点
     * @param range 范围（外围几圈）
     * @param mapInfo 地图信息
     * @param canPass 是否只搜寻可通行的点
     * @return
     */
    export function getTileArea(tile: Point, range: number, mapInfo: MapInfo, canPass: boolean = true): Point[] {
        let checkFun: Function = canPass ? canPassTile : tileInTheMapData;

        let tiles: Point[] = [];
        if (checkFun(tile, mapInfo)) tiles.push(tile);

        let i: number = 0;
        let n: number, p: Point, len: number;
        while (i < range) {
            i++;
            len = i * 2;

            //先找到正上方
            p = tile;
            for (n = 0; n < i; n++) p = getSideTile(p, Constants.D_UP, mapInfo);

            //从正上往右下，直到正右，获取这条边上所有的点
            for (n = 0; n < len; n++) {
                p = getSideTile(p, Constants.D_RIGHT_DOWN, mapInfo);
                if (checkFun(p, mapInfo)) tiles.push(p);
            }

            //从正右往左下，直到正下
            for (n = 0; n < len; n++) {
                p = getSideTile(p, Constants.D_LEFT_DOWN, mapInfo);
                if (checkFun(p, mapInfo)) tiles.push(p);
            }

            //从正下往左上，直到正右
            for (n = 0; n < len; n++) {
                p = getSideTile(p, Constants.D_LEFT_UP, mapInfo);
                if (checkFun(p, mapInfo)) tiles.push(p);
            }

            //从正右往右上，直到正上
            for (n = 0; n < len; n++) {
                p = getSideTile(p, Constants.D_RIGHT_UP, mapInfo);
                if (checkFun(p, mapInfo)) tiles.push(p);
            }
        }

        return tiles;
    }


    /**
     * t1 与 t2 是否为相邻的两个区块
     * @param t1
     * @param t2
     * @param mapInfo
     * @return
     */
    export function isAdjacent(t1: Point, t2: Point, mapInfo: MapInfo): boolean {
        let oa: any[] = (mapInfo.staggered)
            ? (t1.y % 2 == 0 ? Constants.O_EVEN : Constants.O_ODD)
            : Constants.O_RHO;

        for (let d = 1; d < 9; d++)
            if (t2.x == t1.x + oa[d][0] && t2.y == t1.y + oa[d][1]) return true;

        return false;
    }


    //
}