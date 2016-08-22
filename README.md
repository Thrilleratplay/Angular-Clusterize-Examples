# Angular-Clusterize-Examples
Angular.js directives leveraging [Clusterize.js](https://github.com/NeXTs/Clusterize.js) to create virtualized tables

For those who have worked with large data sets in Angular.js likely know the performance limitations of native directives like ngRepeat.  While there are a number of data grids modules for Angular, each seems to have a limitation.  An an example. the feature I needed was rowspan; an attribute of HTML tables.  

Clusterize.js works well with larger data sets and can be pair with Angular.js very easily.  

While I do not have the time to devote to write and maintain a generic directive, I did want to share a few examples that should be a decent starting point for others to expand upon.

Suggestions and pull requests are welcome.  

### angularClusterize-basic.js
Basic example of using Clusterize.js and binding ngClick event.

[Plunker Example](http://plnkr.co/edit/vJ3Sz5?p=preview)

### angularClusterize-pagination.js
Examlpe of Clusterize.js with infinite scrolling and fixed headers.

[Plunker Example](http://plnkr.co/edit/JUAhhh?p=preview)

### angularClusterize-resizableColumns.js
Examlpe of Clusterize.js with infinite scrolling, fixed headers and resizable columns.

[Plunker Example](http://plnkr.co/edit/YR2aLG?p=preview)
