{% assign recap_pages = include.folder | where_exp: "page", "page.path contains 'sessions'" %}

{% for page in recap_pages %}
- <a href="#{{page.title | slugify}}" class="recap-index">{% if page.new %}<span class="new"></span>{% endif %}{{page.title}}    ({{page.date |  localize: '%d %b %Y'}})</a>{% endfor %}

<button type="button" class="expand-all">Espandi tutti</button>

<div class="noindent">

{% for page in recap_pages %}

{% assign title_num_part = page.title | split: " - " | first %}
{% assign title_title_part = page.title | split: " - " | last %}

<span id="{{title_num_part | slugify}}"></span><button type="button" class="collapsible coll-primary" id="{{page.title | slugify}}">{{title_num_part}} - <span class="recap-title">{{title_title_part}}</span></button>
<div class="collapsible-content hidden" markdown="1">

##### {{page.date | localize: '%d %b %Y'}}

{% imgl %}

{{ page.content | markdownify }}

{% endimgl %}

</div>

{% endfor %}

</div>