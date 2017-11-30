---
layout: post
title:  "H5游戏开发之滑动列表"
date:   2017-11-11 14:06:05
categories: H5
tags: H5 Egret 游戏 页游 JavaSCript TypeScript
---

* content
{:toc}

H5游戏开发之滑动列表

<!--more-->
 eui.Scroller 滚动控制容器,是一个常用的组件，详见官方链接：
http://developer.egret.com/cn/github/egret-docs/extension/EUI/container/scroller/index.html
效果：
![效果演示](http://img.blog.csdn.net/20171120084915768?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd3VoYWlzaGVuZ3h4eA==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
Scroller常结合List使用，Scroller负责控制滑动，List负者呈现选项， 常在背包物品列表、商品列表、成就列表、任务列表等中使用，通常会有许多项，少的几个多者上百上千，数量庞大，如果直接通过addChild方法添加，就会造成性能上的问题。而直接使用List的虚拟布局将会大幅度提升性能。
效果代码：

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


**## eui.Scroller + eui.List实现滑动列表**
这是Egret 官网提供了一种列表的实现方式，这种实现的方式是使用了虚拟布局、自定义项呈现器，达到显示多少创建多少的要求，当然，需要了解具体怎么实现的，还需要读者分析底层的处理，或者自己实现试试。

实现方法：
1.首先继承自eui.Scroller 创建自定义组件
ScrollerPanel.ts
```
   module Common {
    	/** 
    	 * 滑动列表
    	 * 使用虚拟布局、自定义项呈现器
    	 * 不需要初始化item只需要添加皮肤
    	 * 
    	 */
	    	export class ScrollerPanel extends eui.Scroller implements       eui.UIComponent {
    		public dataList: eui.List;
   		public constructor() {
    			super();
    			this.skinName = Common.ScrollerPanelSkin;
   		    	this.viewport = this.dataList;
    		}
    		/**
    		 * 通过SkinName 初始化item皮肤
    		 * @param itemSkin item皮肤
   		     */
  	    	public initItemSkin(itemSkin: any): void {
     			this.dataList.itemRendererSkinName = itemSkin;
    		}
   		   /**
  	         *  通过itemRenderer 初始化item皮肤 
    		 *  @param itemRenderer 所有item都要继承 eui.ItemRenderer
    	 	 */
    		public initItemRenderer(itemRenderer: any): void {
    			this.dataList.itemRenderer = itemRenderer;
    		}
    		/** 进行数据绑定 */
    		public bindData(data: Array<any>): void {
    			let arrCollection: eui.ArrayCollection = new      eui.ArrayCollection(data);
   			this.dataList.dataProvider = arrCollection;
    		}
    	}
    }
```
ScrollerPanelSkin.exml

```
    <?xml version="1.0" encoding="utf-8"?>
    <e:Skin class="Common.ScrollerPanelSkin" minWidth="20" minHeight="20" xmlns:e="http://ns.egret.com/eui"
           xmlns:w="http://ns.egret.com/wing">
      <e:HScrollBar id="horizontalScrollBar" width="100%" bottom="0" visible="false" autoVisibility="false" />
        <e:VScrollBar id="verticalScrollBar" height="100%" right="0" visible="false" autoVisibility="false" />
       <e:List id="dataList" width="100%" height="100%" x="0" y="0">
            <e:layout>
               <e:VerticalLayout horizontalAlign="center" verticalAlign="middle" />
           </e:layout>
         </e:List>
   </e:Skin>
```
ScrollerPanel 继承了eui.Scroller ，使用时在实例化之后使用initItemSkin或者initItemRenderer初始化item样式。通过设置this.dataList.dataProvider绑定列表数据，在此构建外部一个绑定数据的方法，初始化绑定的数据源arrCollection，每次数据更新是重新绑定。Item的数据是按照arrCollection顺序来进行绑定的。

初始化Item的两种方式的区别：

initItemSkin：使用的是exml文件描述或者名称，通过可是话直接创建，在通常除了绑定数据，不再做其他操作，可以采用这种方式，下exml 中使用数据的方式如：
ItemSkin.exml
...
<e:Lable text="{data.lable}" /> 
...
 data是绑定的数据对象形如：data={lable:"demoText",bg:"demo_png"}
那么e:Lable 的text内容就是demoText 

initItemRenderer： 使用的是eui.ItemRenderer的子类对象，也是一个自定义组件，View方面使用exml，同时在类中实现一些特殊的操作，一些数据判断，筛选，格式化等。

item点击事件：
this.scro.dataList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTouch, this);
显示选项使用的是eui.List而不是DataGroup是因为DataGroup无法监听ItemTapEvent事件，在自定义组件中，建议把不需要监听事件的设为false,避免多次触发事件响应，
