var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("utils/ResUtil", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResUtil = /** @class */ (function () {
        function ResUtil() {
        }
        ResUtil.getMapSmall = function (id) {
            return this.Map_Root + "/" + id + "/s.jpg";
        };
        ResUtil.getMapTiled = function (id, x, y) {
            return this.Map_Root + "/" + id + "/tileds/" + x + "_" + y + ".jpg";
        };
        ResUtil.getMapConfig = function (id) {
            return this.Map_Root + "/" + id + "/map.json";
        };
        ResUtil.Screen_W = 800;
        ResUtil.Screen_H = 480;
        ResUtil.Screen_W_2 = 400;
        ResUtil.Screen_H_2 = 240;
        ResUtil.Map_Root = "resource/scene";
        return ResUtil;
    }());
    exports.ResUtil = ResUtil;
});
define("view/BaseLayer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseLayer = /** @class */ (function (_super) {
        __extends(BaseLayer, _super);
        function BaseLayer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return BaseLayer;
    }(egret.DisplayObjectContainer));
    exports.BaseLayer = BaseLayer;
});
define("view/LayerManager", ["require", "exports", "view/BaseLayer"], function (require, exports, BaseLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 层级管理器
     */
    var LayerManager = /** @class */ (function () {
        function LayerManager() {
            this.sceneLayer = new BaseLayer_1.BaseLayer();
            this.uiLayer = new BaseLayer_1.BaseLayer();
            this.panelLayer = new BaseLayer_1.BaseLayer();
            this.effectLayer = new BaseLayer_1.BaseLayer();
        }
        Object.defineProperty(LayerManager, "instacne", {
            get: function () {
                return this._instance || (this._instance = new LayerManager());
            },
            enumerable: true,
            configurable: true
        });
        LayerManager.prototype.initLayer = function (main) {
            main.addChild(this.sceneLayer);
            // main.addChild(this.uiLayer);
            // main.addChild(this.panelLayer);
            // main.addChild(this.effectLayer);
        };
        return LayerManager;
    }());
    exports.LayerManager = LayerManager;
});
define("scene/MapVO", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapVO = /** @class */ (function () {
        function MapVO() {
        }
        MapVO.prototype.bindJson = function (id, data) {
            this.id = id;
            this.tiledW = data.divideBlockW;
            this.tiledH = data.divideBlockH;
            this.gridH = data.mapGridH;
            this.gridW = data.mapGridW;
            this.mapH = data.mapH;
            this.mapW = data.mapW;
            this.col = Math.floor(this.mapH / this.tiledH);
            this.row = Math.floor(this.mapW / this.tiledW);
        };
        return MapVO;
    }());
    exports.MapVO = MapVO;
});
define("scene/MapLayer", ["require", "exports", "scene/MapVO", "utils/ResUtil"], function (require, exports, MapVO_1, ResUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapLayer = /** @class */ (function (_super) {
        __extends(MapLayer, _super);
        function MapLayer() {
            var _this = _super.call(this) || this;
            // 当前瓦片起始行列索引
            _this._startCol = -1;
            _this._startRow = -1;
            _this._mapVO = new MapVO_1.MapVO();
            return _this;
        }
        MapLayer.prototype.loadMap = function (id, readyFun, readyCaller) {
            if (this.id != id) {
                this.reset();
                this.id = id;
                this.readyFun = readyFun;
                this.readyCaller = readyCaller;
                var url = ResUtil_1.ResUtil.getMapConfig(this.id);
                RES.getResByUrl(url, this.onConfigComplete, this, RES.ResourceItem.TYPE_JSON);
            }
        };
        MapLayer.prototype.onConfigComplete = function (data) {
            if (data) {
                this._mapVO.bindJson(this.id, data);
                this._colLen = Math.floor(ResUtil_1.ResUtil.Screen_H / this._mapVO.tiledH) + 2;
                this._rowLen = Math.floor(ResUtil_1.ResUtil.Screen_W / this._mapVO.tiledW) + 2;
                this.loadSmall();
            }
        };
        Object.defineProperty(MapLayer.prototype, "mapVO", {
            get: function () {
                return this._mapVO;
            },
            enumerable: true,
            configurable: true
        });
        MapLayer.prototype.loadSmall = function () {
            var url = ResUtil_1.ResUtil.getMapSmall(this.id);
            RES.getResByUrl(url, this.onSmallComplete, this, RES.ResourceItem.TYPE_IMAGE);
        };
        MapLayer.prototype.onSmallComplete = function (texture) {
            if (texture) {
                this.small = new egret.SpriteSheet(texture);
                this.createMapSmallImage(texture.textureWidth, texture.textureHeight);
                this.readyFun && this.readyFun.apply(this.readyCaller);
            }
        };
        MapLayer.prototype.createMapSmallImage = function (width, height) {
            var small_width = width / (this._mapVO.mapW / this._mapVO.tiledW);
            var small_height = height / (this._mapVO.mapH / this._mapVO.tiledH);
            var rows = this._mapVO.mapW / this._mapVO.tiledW;
            var cols = this._mapVO.mapH / this._mapVO.tiledH;
            for (var x = 0; x < cols; x++) {
                for (var y = 0; y < rows; y++) {
                    this.small.createTexture(x + "_" + y, y * small_width, x * small_height, small_width, small_height, 0, 0);
                }
            }
        };
        MapLayer.prototype.fillSmallMap = function (startx, starty, tx, ty) {
            var texture = this.small.getTexture(startx + "_" + starty);
            this.fillTile(tx, ty, texture);
        };
        MapLayer.prototype.render = function (flush, x, y) {
            if (flush === void 0) { flush = false; }
            var col = Math.floor(y / this._mapVO.tiledH);
            var row = Math.floor(x / this._mapVO.tiledW);
            this.makeData(col, row, flush);
            // 进行平滑移动
            if (this._startCol == col &&
                this._startRow == row &&
                this._posFlush != null) {
                this.x = -x % this._mapVO.tiledW;
                this.y = -y % this._mapVO.tiledH;
            }
        };
        MapLayer.prototype.makeData = function (startCol, startRow, flush) {
            if (this._modBuffer) {
                this._modBuffer = false;
            }
            if (this._startCol == startCol && this._startRow == startRow) {
                return;
            }
            this._startCol = startCol;
            this._startRow = startRow;
            this._posFlush = [];
            var max_row = Math.min(startRow + this._rowLen, this.mapVO.row);
            var max_col = Math.min(startCol + this._colLen, this.mapVO.col);
            var key;
            for (var col = startCol; col < max_col; col++) {
                for (var row = startRow; row < max_row; row++) {
                    key = col + '_' + row;
                    if (col >= 0 && row >= 0) {
                        if (this._resPool.tiles[key]) {
                            this.fillTile((col - this._startCol), (row - this._startRow), this._resPool.tiles[key]);
                        }
                        else {
                            this._posFlush.push({ x: col, y: row, cols: this._startCol, rows: this._startRow, id: this._mapVO.id });
                            this.fillSmallMap(col, row, (col - this._startCol), (row - this._startRow));
                        }
                    }
                }
            }
            this.loadTiles();
        };
        MapLayer.prototype.fillTile = function (tx, ty, texture) {
            var name = tx + "_" + ty;
            var bitmap = this.getChildByName(name);
            if (bitmap == null) {
                bitmap = MapPool.GetTile();
                bitmap.x = ty * this._mapVO.tiledW;
                bitmap.y = tx * this._mapVO.tiledH;
                bitmap.name = name;
                this.addChild(bitmap);
            }
            bitmap.texture = texture;
            bitmap.width = this._mapVO.tiledW;
            bitmap.height = this._mapVO.tiledH;
        };
        /**
         加载图块
         * @param texture
         */
        MapLayer.prototype.loadTiles = function (texture) {
            if (texture === void 0) { texture = null; }
            if (this._mapVO == null) {
                return;
            }
            /**
             * texture 不为空则加载完成
             */
            if (texture != null) {
                var pos = this._tempNowLoad;
                if (!pos || pos.id != this._mapVO.id) {
                    texture.dispose();
                    return;
                }
                var key = pos.x + "_" + pos.y;
                if (this._resPool.tiles[key] == null) {
                    this._resPool.tiles[key] = texture;
                }
                var tx = pos.x - this._startCol;
                var ty = pos.y - this._startRow;
                if (pos.cols === this._startCol && pos.rows === this._startRow) {
                    this.fillTile(tx, ty, texture);
                }
                this._tempNowLoad = null;
            }
            if (this._posFlush.length == 0) {
                this._modBuffer = true;
                return;
            }
            else if (!this._tempNowLoad) {
                this._tempNowLoad = this._posFlush.pop();
                var pos = this._tempNowLoad;
                var url = ResUtil_1.ResUtil.getMapTiled(this._mapVO.id, pos.x, pos.y);
                this._resUrlList = this._resUrlList || [];
                this._resUrlList.push(url);
                RES.getResByUrl(url, this.loadTiles, this);
            }
        };
        /**
         * 重置清空
         */
        MapLayer.prototype.reset = function () {
            this._posFlush = [];
            this._resUrlList = [];
            this._resPool = { tiles: {} };
            var loop;
            while (this.numChildren) {
                loop = this.removeChildAt(0);
                loop.texture.dispose();
                loop.texture = null;
                MapPool.BackPool(loop);
            }
            this._startCol = -1;
            this._startRow = -1;
            this._tempNowLoad = null;
            this.readyFun = null;
            this.readyCaller = null;
            // 销毁旧资源
            if (this.id) {
                var url = ResUtil_1.ResUtil.getMapConfig(this.id);
                RES.destroyRes(url);
                url = ResUtil_1.ResUtil.getMapSmall(this.id);
                RES.destroyRes(url);
            }
        };
        MapLayer.prototype.destroy = function () {
            this._posFlush = null;
            this._resUrlList = null;
            this._resPool = null;
            var loop;
            while (this.numChildren) {
                loop = this.removeChildAt(0);
                loop.texture = null;
                MapPool.BackPool(loop);
            }
            this._startCol = null;
            this._startRow = null;
            this._tempNowLoad = null;
            this.readyFun = null;
            this.readyCaller = null;
        };
        return MapLayer;
    }(egret.Sprite));
    exports.MapLayer = MapLayer;
    var MapPool = /** @class */ (function () {
        function MapPool() {
        }
        MapPool.RebuildPool = function (num) {
            if (MapPool._tilePool.length > num) {
                while (MapPool._tilePool.length > num) {
                    MapPool._tilePool.pop();
                }
            }
            else {
                while (MapPool._tilePool.length < num) {
                    MapPool._tilePool.push(new egret.Bitmap());
                }
            }
        };
        MapPool.BackPool = function (data) {
            if (MapPool._tilePool.indexOf(data) == -1) {
                MapPool._tilePool.push(data);
            }
        };
        MapPool.GetTile = function () {
            var data = MapPool._tilePool.length ? MapPool._tilePool.pop() : new egret.Bitmap();
            data.texture = null;
            return data;
        };
        // 地图池
        MapPool._tilePool = new Array();
        return MapPool;
    }());
});
define("scene/Camera", ["require", "exports", "utils/ResUtil"], function (require, exports, ResUtil_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Camera = /** @class */ (function () {
        function Camera(x, y, w, h) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (w === void 0) { w = ResUtil_2.ResUtil.Screen_W; }
            if (h === void 0) { h = ResUtil_2.ResUtil.Screen_H; }
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.dirX = -1;
            this.dirY = -1;
        }
        /**
         * 设置镜头区域
         * @param x
         * @param y
         * @param w
         * @param h
         */
        Camera.prototype.setViewport = function (x, y, w, h) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        };
        /**
         * 设置视图区域
         * @param w
         * @param h
         */
        Camera.prototype.setViewSize = function (w, h) {
            this.maxW = w;
            this.maxH = h;
            this.maxX = w - this.width;
            this.maxY = h - this.height;
        };
        /**
         * 设置镜头跟随
         * @param obj
         */
        Camera.prototype.lookAt = function (obj) {
            this.foucesObj = obj;
        };
        Camera.prototype.update = function () {
            if (this.isRender) {
                if (this.foucesObj) {
                    this.setPos(this.foucesObj.x, this.foucesObj.y);
                }
                // this.moveCamera();
            }
        };
        Camera.prototype.moveCamera = function () {
            if (this.dirX != -1) {
                if (this.x == this.dirX) {
                    this.dirX = -1;
                    this.xSpeed = 0;
                }
            }
            if (this.dirY != -1) {
                if (this.y == this.dirY) {
                    this.dirY = -1;
                    this.ySpeed = 0;
                }
            }
            if (this.xSpeed || this.ySpeed) {
                this.setPos(this.x + this.xSpeed, this.y + this.ySpeed);
            }
        };
        /**
         * 移动到指定点
         */
        Camera.prototype.moveTo = function (x, y, speed) {
            if (speed === void 0) { speed = 1; }
            // this.foucesObj = null;
            // this.moveSpeed = speed;
            // this.dirX = x;
            // this.dirY = y;
            // let p1: egret.Point = egret.Point.create(this.x, this.y);
            // let p2: egret.Point = egret.Point.create(x, y);
            // let d = egret.Point.distance(p1, p2);
            // this.xSpeed = (x - this.x) / d * speed;
            // this.ySpeed = (y - this.y) / d * speed;
            this.setPos(x, y);
        };
        Camera.prototype.setPos = function (x, y) {
            this.x = x > this.maxX ? this.maxX : x;
            this.y = y > this.maxY ? this.maxY : y;
            this.x = this.x < 0 ? 0 : this.x;
            this.y = this.y < 0 ? 0 : this.y;
        };
        /**
         * 设置焦点位置
         */
        Camera.prototype.fouces = function (x, y) {
        };
        return Camera;
    }());
    exports.Camera = Camera;
});
define("scene/Scene", ["require", "exports", "scene/MapLayer", "scene/Camera", "utils/ResUtil"], function (require, exports, MapLayer_1, Camera_1, ResUtil_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Scene = /** @class */ (function (_super) {
        __extends(Scene, _super);
        function Scene() {
            var _this = _super.call(this) || this;
            _this.speed = 0.1;
            _this.camera = new Camera_1.Camera();
            _this.mapLayer = new MapLayer_1.MapLayer();
            _this.touchLayer = new egret.Sprite();
            _this.addChild(_this.mapLayer);
            _this.addChild(_this.touchLayer);
            _this.initTouch();
            return _this;
        }
        Scene.prototype.initTouch = function () {
            this.touchLayer.graphics.clear();
            this.touchLayer.graphics.beginFill(0, 0);
            this.touchLayer.graphics.drawRect(0, 0, ResUtil_3.ResUtil.Screen_W, ResUtil_3.ResUtil.Screen_H);
            this.touchLayer.graphics.endFill();
            this.touchLayer.alpha = 0;
            this.touchLayer.touchEnabled = true;
            this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            this.touchLayer.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
        };
        Scene.prototype.onTouchBegin = function (event) {
            var x = event.stageX;
            var y = event.stageY;
            this.tempPoint = egret.Point.create(x, y);
        };
        Scene.prototype.onTouchMove = function (event) {
            var x = event.stageX;
            var y = event.stageY;
            if (this.camera) {
                this.camera.setPos(this.camera.x + x - this.tempPoint.x, this.camera.y + y - this.tempPoint.y);
                this.tempPoint.x = x;
                this.tempPoint.y = y;
            }
        };
        Scene.prototype.onTouchEnd = function (event) {
            var x = event.stageX;
            var y = event.stageY;
        };
        Scene.prototype.setCamera = function (camera) {
            this.camera = camera;
        };
        Scene.prototype.loadMap = function (id) {
            if (!this.mapLayer) {
                this.mapLayer = new MapLayer_1.MapLayer();
                this.addChild(this.mapLayer);
            }
            this.mapLayer.loadMap(id, this.onMapReady, this);
        };
        Scene.prototype.onMapReady = function () {
            this.camera.setViewSize(this.mapLayer.mapVO.mapW, this.mapLayer.mapVO.mapH);
            this.startRender();
        };
        Scene.prototype.render = function () {
            if (this.isRender && this.camera) {
                this.camera.update();
                this.mapLayer.render(false, this.camera.x, this.camera.y);
            }
        };
        Scene.prototype.startRender = function () {
            if (!this.isRender) {
                this.isRender = true;
                this.camera.isRender = true;
            }
            if (!this.isOnTicker) {
                this.isOnTicker = true;
                egret.Ticker.getInstance().register(this.render, this);
            }
        };
        Scene.prototype.stopRender = function () {
            if (this.isRender) {
                this.isRender = false;
                this.camera.isRender = false;
            }
            if (this.isOnTicker) {
                this.isOnTicker = false;
                egret.Ticker.getInstance().unregister(this.render, this);
            }
        };
        return Scene;
    }(egret.DisplayObjectContainer));
    exports.Scene = Scene;
});
define("scene/SceneManager", ["require", "exports", "scene/Scene", "view/LayerManager"], function (require, exports, Scene_1, LayerManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 场景管理器
     */
    var SceneManager = /** @class */ (function () {
        function SceneManager() {
            this.scene = new Scene_1.Scene();
            LayerManager_1.LayerManager.instacne.sceneLayer.addChild(this.scene);
        }
        Object.defineProperty(SceneManager, "instacne", {
            get: function () {
                return this._instance || (this._instance = new SceneManager());
            },
            enumerable: true,
            configurable: true
        });
        SceneManager.prototype.changeScene = function (id) {
            if (id === void 0) { id = 1001; }
            this.scene.loadMap(id);
        };
        return SceneManager;
    }());
    exports.SceneManager = SceneManager;
});
define("Main", ["require", "exports", "utils/ResUtil", "view/LayerManager", "scene/SceneManager"], function (require, exports, ResUtil_4, LayerManager_2, SceneManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Main = /** @class */ (function (_super) {
        __extends(Main, _super);
        function Main() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isThemeLoadEnd = false;
            _this.isResourceLoadEnd = false;
            return _this;
        }
        Main.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
            egret.lifecycle.addLifecycleListener(function (context) {
            });
            egret.lifecycle.onPause = function () {
                egret.ticker.pause();
            };
            egret.lifecycle.onResume = function () {
                egret.ticker.resume();
            };
            var assetAdapter = new AssetAdapter();
            egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
            egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
            this.loadingView = new LoadingUI();
            this.stage.addChild(this.loadingView);
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
            RES.loadConfig("resource/default.res.json", "resource/");
            ResUtil_4.ResUtil.Screen_H = egret.MainContext.instance.stage.stageHeight;
            ResUtil_4.ResUtil.Screen_W = egret.MainContext.instance.stage.stageWidth;
        };
        Main.prototype.onConfigComplete = function (event) {
            RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
            var theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            RES.loadGroup("preload");
        };
        Main.prototype.onThemeLoadComplete = function () {
            this.isThemeLoadEnd = true;
            this.createScene();
        };
        Main.prototype.onResourceLoadComplete = function (event) {
            if (event.groupName == "preload") {
                this.stage.removeChild(this.loadingView);
                RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
                RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
                RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
                RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
                this.isResourceLoadEnd = true;
                this.createScene();
            }
        };
        Main.prototype.createScene = function () {
            if (this.isThemeLoadEnd && this.isResourceLoadEnd) {
                this.startCreateScene();
            }
        };
        Main.prototype.onItemLoadError = function (event) {
            console.warn("Url:" + event.resItem.url + " has failed to load");
        };
        Main.prototype.onResourceLoadError = function (event) {
            console.warn("Group:" + event.groupName + " has failed to load");
            this.onResourceLoadComplete(event);
        };
        Main.prototype.onResourceProgress = function (event) {
            if (event.groupName == "preload") {
                this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
            }
        };
        Main.prototype.startCreateScene = function () {
            LayerManager_2.LayerManager.instacne.initLayer(this);
            SceneManager_1.SceneManager.instacne.changeScene();
        };
        return Main;
    }(eui.UILayer));
    exports.Main = Main;
});
var AssetAdapter = /** @class */ (function () {
    function AssetAdapter() {
    }
    /**
     * @language zh_CN
     * 解析素材
     * @param source 待解析的新素材标识符
     * @param compFunc 解析完成回调函数，示例：callBack(content:any,source:string):void;
     * @param thisObject callBack的 this 引用
     */
    AssetAdapter.prototype.getAsset = function (source, compFunc, thisObject) {
        function onGetRes(data) {
            compFunc.call(thisObject, data, source);
        }
        if (RES.hasRes(source)) {
            var data = RES.getRes(source);
            if (data) {
                onGetRes(data);
            }
            else {
                RES.getResAsync(source, onGetRes, this);
            }
        }
        else {
            RES.getResByUrl(source, onGetRes, this, RES.ResourceItem.TYPE_IMAGE);
        }
    };
    return AssetAdapter;
}());
var LoadingUI = /** @class */ (function (_super) {
    __extends(LoadingUI, _super);
    function LoadingUI() {
        var _this = _super.call(this) || this;
        _this.createView();
        return _this;
    }
    LoadingUI.prototype.createView = function () {
        this.textField = new egret.TextField();
        this.addChild(this.textField);
        this.textField.y = 300;
        this.textField.width = 480;
        this.textField.height = 100;
        this.textField.textAlign = "center";
    };
    LoadingUI.prototype.setProgress = function (current, total) {
        this.textField.text = "Loading..." + current + "/" + total;
    };
    return LoadingUI;
}(egret.Sprite));
var ThemeAdapter = /** @class */ (function () {
    function ThemeAdapter() {
    }
    /**
     * 解析主题
     * @param url 待解析的主题url
     * @param compFunc 解析完成回调函数，示例：compFunc(e:egret.Event):void;
     * @param errorFunc 解析失败回调函数，示例：errorFunc():void;
     * @param thisObject 回调的this引用
     */
    ThemeAdapter.prototype.getTheme = function (url, compFunc, errorFunc, thisObject) {
        function onGetRes(e) {
            compFunc.call(thisObject, e);
        }
        function onError(e) {
            if (e.resItem.url == url) {
                RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
                errorFunc.call(thisObject);
            }
        }
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
        RES.getResByUrl(url, onGetRes, this, RES.ResourceItem.TYPE_TEXT);
    };
    return ThemeAdapter;
}());
