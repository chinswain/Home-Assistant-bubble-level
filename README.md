Copy realistic-bubble-level-card.js to \homeassistant\www\

Settings -> Dashboards -> Menu (Three elipses) -> Resources -> ADD RESOURCE

URL: /local/realistic-bubble-level-card.js
Resource type: JavaScript Module

To use, add a manual card:

type: custom:realistic-bubble-level-card<br>
x_entity: sensor.myxdata<br>
y_entity: sensor.myydata

