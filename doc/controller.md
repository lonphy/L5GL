## Controllers

#### Controller (控制器基类)
##### **成员变量**
- `repeat`: 动画重复方式, 有效值:
	- `Controller.RT_CLAMP`(默认), 表现为单次执行，结果为最终状态
	- `Controller.RT_WRAP` 表现为重复执行, 重复路径: 初始 -> 最终
	- `Controller.RT_CYCLE` 表现为重复执行, 重复路径: 初始->最终->初始
- `active`: 是否处于活动状态, 默认`true`
- `minTime`: 最小时间点, 单位ms
- `maxTime`: 最大时间点, 单位ms
- `frequency`: 频率
- `phase`: 偏移相位, 单位ms

#### TransformController (变换控制器基类)

#### IKController (控制器)

#### ParticleController (粒子控制器基类)

#### BlendTransformController (混合变换控制器)
#### KeyframeController (关键帧控制器)
#### MorphController (变体控制器)
#### PointController (点精灵控制器)
#### SkinController (蒙皮控制器)