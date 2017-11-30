# Egret H5游戏开发之Scroller的使用 #
eui.Scroller，滑动列表，游戏必不可少的一个组件，常用在任务列表，物品列表，菜单列表，好友列表，消息列表等等。
演示：

![1](http://www.whsblog.cn/img/scro_01.gif) ![2](http://www.whsblog.cn/img/scro_02.gif)

Scroller包含有两个方法的滚动条，即水平滚动条horizontalScrollBar （eui.HScrollBar对象），垂直滚动条verticalScrollBar（eui.VScrollBar对象）。我们可以通过设置scrollPolicyH 和scrollPolicyV来控制两个方向的滚动条是否启用，或者直接使用eui.VScrollBar或者eui.HScrollBar而 使用Scroller组件达到相同效果。
Scroller简单代码示例(第1个Gif的代码)：
   
```
        <e:Scroller id="scro" width="100%" height="100%" verticalCenter="0" horizontalCenter="0" scrollPolicyV="on"
                    bottom="10" left="10" right="10" top="10">
            <!-- itemRendererSkinName 为选项的皮肤 -->
            <e:List id="dataList" width="100%" height="100%" x="174" y="131" itemRendererSkinName="ItemSkin" bottom="10"
                    left="10" right="10" top="10">
                <!-- 布局 -->
                <e:layout>
                    <e:VerticalLayout horizontalAlign="center" verticalAlign="top" />
                </e:layout>
                <!-- 演示的数据 -->
                <e:ArrayCollection>
                    <e:Array>
                        <e:Object lab="item_1" />
                        <e:Object lab="item_2" />
                        <e:Object lab="item_3" />
                        <e:Object lab="item_4" />
                        <e:Object lab="item_5" />
                    </e:Array>
                </e:ArrayCollection>

            </e:List>
        </e:Scroller>
```
## 创建
- 选项创建
  这里的选项，是指某个物品，某个任务，某个菜单等等，有两种创建方式：一种是只需要创建创建皮肤，一种是创建成组件。两种方式都是通过数据绑定方式呈现，后续讲解数据绑定。
  皮肤示例：

```
<?xml version="1.0" encoding="utf-8"?>
<e:Skin class="ItemSkin" width="100" height="100" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing"
        states="up,down">
	<e:Image source="frame_text_4" scale9Grid="12,12,6,6" width="100%" height="100%" horizontalCenter="0"
	         verticalCenter="0" source.down="chatVipBg" scale9Grid.down="8,9,2,4" />
	<!-- 数据呈现 -->
	<e:Label id="itemLab" text="{data.lab}" textColor="0x110202" textAlign="center" horizontalCenter="0" verticalCenter="0" />
</e:Skin>
```
 这里创建一个名为ItemSkin的皮肤。两种状态：up,down。其中down是选中时状态，itemLab是我们要呈现的数据，当然也可是是其他组件，按照需求去控制。
 text="{data.lab}"是指text的内容取data.lab的值
 在示例1中数据源：
 
```
 <e:ArrayCollection>
                    <e:Array>
                        <e:Object lab="item_1" />
                        <e:Object lab="item_2" />
                        <e:Object lab="item_3" />
                        <e:Object lab="item_4" />
                        <e:Object lab="item_5" />
                    </e:Array>
                </e:ArrayCollection>
```
- 创建滑动列表
  我们可以直接使用<e:Group>包含eui.VScrollBar或者eui.HScrollBar+List创建，也可以自己将List作为Scroller的子组件进行呈现。这里直接使用Scroller+List。
 代码见上上上面。
 指定List的选项皮肤：
```
itemRendererSkinName="ItemSkin" 
```
使用皮肤的好处就是所见即所得
- 调整布局
 这里调整List的布局

```
 
                <e:layout>
                    <e:VerticalLayout horizontalAlign="center" verticalAlign="top" />
                </e:layout>
```
因为我这里一行只有1项，所以只需要VerticalLayout 水平居中，垂直方向顶部对齐。
## 调整
 上述只是简单的创建滑动列表，在皮肤中，我们只能绑定数据，实际开发中，我们常常通过数据进行一些逻辑处理，比如状态控制，图片替换，那么，我们可以直接创建ItemPanel 组件，如：
 
```
class ItemPanel extends eui.ItemRenderer{
	public constructor() {
		super();
		this.skinName = ItemSkin;
	
	}

	protected dataChanged(){
 
		  let list  = this.parent as eui.List;
		 this.selected = list.selectedItem == this.data;
	}
}
```


 
 


