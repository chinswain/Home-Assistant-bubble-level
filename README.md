Copy realistic-bubble-level-card.js to \homeassistant\www\

Settings -> Dashboards -> Menu (Three elipses) -> Resources -> ADD RESOURCE

URL: /local/realistic-bubble-level-card.js
Resource type: JavaScript Module

To use, add a manual card:

type: custom:realistic-bubble-level-card<br>
x_entity: sensor.myxdata<br>
y_entity: sensor.myydata<br>
multiplier: 5<br>
title: Position<br>
icon: mdi:axis-z-rotate-clockwise<br>

<img src="https://github.com/chinswain/Home-Assistant-bubble-level/blob/main/bubble.png" alt="">

For the bar level:

type: custom:styled-bar-bubble-level-card<br>
x_entity: sensor.knebworth_apiary_hive_1_position_x<br>
horizontal: true

<img src="https://github.com/chinswain/Home-Assistant-bubble-level/blob/main/bar.png" alt="">
