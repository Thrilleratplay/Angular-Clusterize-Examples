/* global Clusterize */

/**
 * @preserve
 * Clusterize.js Angular.js directive example
 *
 * https://github.com/Thrilleratplay/Angular-Clusterize-Examples
 *
 * Copyright 2016 Tom Hiller
 * Released under the GPLv3 license:
 * http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function () {
  'use strict';

  // Directive declaration
  angular.module('angularClusterize', [])
    .directive('angularClusterize', ['$compile', '$timeout', '$document', _angularClusterize]);

  /**
   * Angular Clusterize directive.
   *
   * @param   {Object} $compile  AngularJs $compile service.
   * @param   {Object} $timeout  AngularJs $timeout service.
   * @param   {Object} $document AngularJs $document service.
   * @returns {Object}           Angular Clusterize directive.
   */
  function _angularClusterize($compile, $timeout, $document) {
    /**
     * AngularClusterize directive link.
     *
     * @param  {Object} $scope Directive scope.
     * @param  {Object} $elem   Directive element.
     *
     * @returns {undefined}
     */
    function _linkFn($scope, $elem) {
      var MIN_COL_WIDTH_IN_PX = 50;

      // ************************************************************
      // *********************** DOM Elements ***********************
      // ************************************************************
      //  Fixed header - wrapper element
      var headerDiv = $elem[0].querySelector('div.clusterize-header');

      //  Fixed header - scroll wrapper element
      var headerDivScroll = headerDiv.firstElementChild;

      // Fixed header - header TABLE element
      var headerTable = headerDivScroll.firstElementChild;

      // Fixed header - THEAD element
      var headerThead = headerTable.querySelector('.fixed-header');

      // Fixed header - COLGROUP element
      var headerColGrp = headerTable.querySelector('colgroup');

      // Content - wrapper element (Clusterize.js "Content area")
      var contentDiv = $elem[0].querySelector('div.clusterize-scroll');

      // Content - content TABLE element
      var contentTable = contentDiv.firstElementChild;

      // Content - COLGROUP element
      var contentColGrp = contentTable.querySelector('colgroup');

      // Content - TBODY elements (Clusterize.js "Scroll area")
      var contentTbody = contentTable.querySelector('tbody.clusterize-content');

      // ************************************************************
      // ********************** initialization **********************
      // ************************************************************
      $scope.colNames = $scope.colNames || [];
      $scope.rows = $scope.rows || [];

      // Initial Clusterize.js
      $scope.clusterize = new Clusterize({
        rows: _buildRows($scope.rows),
        scrollElem: contentDiv,
        contentElem: contentTbody
      });

      /**
       * Override clusterize html function.
       *
       * @param  {String[]} data Rows to compile.
       *
       * @returns {undefined}
       */
      $scope.clusterize.html = function (data) {
        contentTbody.innerHTML = data;

        // Update rendered rows
        $compile(contentTbody)($scope);

        if (contentTable.offsetWidth && contentTable.style.tableLayout !== 'fixed') {
          $scope.$applyAsync($scope.initialSyncWidths);
        }
      };

      /**
       * Synchronize element withs after row data is first added.  Table layout
       * intially set to auto resize then changed to fixed layout.
       *
       * @returns {undefined}
       */
      $scope.initialSyncWidths = function () {
        var contentRow = contentTbody.querySelectorAll('tr:first-child td');

        angular.forEach(contentRow, function (contentTd, colIndex) {
          if (contentTd.offsetWidth > MIN_COL_WIDTH_IN_PX) {
            headerColGrp.children[colIndex].style.width = contentTd.offsetWidth + 'px';
            contentColGrp.children[colIndex].style.width = contentTd.offsetWidth + 'px';
          } else {
            headerColGrp.children[colIndex].style.width = MIN_COL_WIDTH_IN_PX + 'px';
            contentColGrp.children[colIndex].style.width = MIN_COL_WIDTH_IN_PX + 'px';
          }
        });

        headerTable.style.tableLayout = 'fixed';
        contentTable.style.tableLayout = 'fixed';
        $scope.syncDimensions();
      };

      /**
       * Synchronize width of interdependent elements.
       *
       * @param {number} width Calculated width.
       *
       * @returns {undefined}
       */
      $scope.syncDimensions = function (width) {
        width = width || contentTable.offsetWidth;

        // contentDiv.style.width = width + 'px';
        headerTable.style.width = width + 'px';
        headerThead.style.width = width + 'px';
        contentTable.style.width = width + 'px';
      };

      // ************************************************************
      // ************************* watchers *************************
      // ************************************************************
      // watch for changes and update
      $scope.$watch(function () {
        return {
          rows: $scope.rows,
          colNames: $scope.colNames
        };
      }, function (newVal, oldVal) {
        var diffrowData;
        var scrollWidth;

        // If no data, do nothing
        if (!newVal.rows) {
          return;
        } else if (newVal.colNames && !angular.equals(newVal.colNames, oldVal.colNames)) {
          // If the columns change, rebuild the entire table
          $scope.clusterize.update(_buildRows($scope.rows, $scope.colNames));
          $scope.$applyAsync($scope.clusterize.refresh);
        } else if (newVal.rows.length !== oldVal.rows.length) {
          // If new row data, build new HTML rows and append to clusterize
          diffrowData = newVal.rows.slice(oldVal.rows.length);

          $scope.clusterize.append(_buildRows(diffrowData, $scope.colNames));

          $scope.$applyAsync($scope.clusterize.refresh);
        }

        // Offset for vertical scroll
        scrollWidth = contentDiv.offsetWidth - contentDiv.scrollWidth;
        headerDivScroll.style.marginRight = scrollWidth + 'px';

        // Check if table has been initialized
        if ($scope.rows.length && contentTable.offsetWidth
        && contentTable.style.tableLayout !== 'fixed') {
          $scope.$applyAsync($scope.initialSyncWidths);
        }
      }, true);

      // Link header and content horizontal scrolls
      angular.element(contentDiv).on('scroll', function () {
        headerDivScroll.scrollLeft = contentDiv.scrollLeft;

        if ((contentDiv.scrollTop >= (contentTable.offsetHeight - contentDiv.clientHeight - 1)) &&
            angular.isFunction($scope.onLastRow)) {
          // Fires on last row
          $scope.onLastRow();
        }
      });

      angular.element(headerDiv).on('scroll', function () {
        contentDiv.scrollLeft = headerDivScroll.scrollLeft;
      });

      // ************************************************************

      $timeout(function () {
        var scrollbarHeight = headerDivScroll.scrollHeight - headerDivScroll.offsetHeight;

        // HACK: hide header scrollbar.  Only webkit allows to hide scrollbar via CSS.
        headerDivScroll.style.marginBottom = scrollbarHeight + 'px';

        // HACK: This is needed to correctly bind angular when first loaded
        $compile(contentTbody)($scope);
      });

      // ************************************************************
      // ******************* Column resize functions ******************
      // ************************************************************
      /**
       * User triggered resize column function.
       *
       * @param {Object}  mousedownEvent  DOM event.
       * @param {number} colNum           Column number to find corresponding faux column.
       *
       * @returns {undefined}
       */
      $scope.resizeCol = function (mousedownEvent, colNum) {
        // Current header TH element
        var selectedTh = headerThead.firstElementChild.children[colNum];

        // Current content and header COLs
        var headerCol = headerColGrp.children[colNum];
        var contentCol = contentColGrp.children[colNum];

        // Initial width of content table
        var startTableWidth = contentTable.offsetWidth;

        // Initial width of column
        var startWidth = selectedTh.offsetWidth;

        // Initial offset
        var startXOffset = mousedownEvent.pageX;

        // Handle mouse up event and remove bidings
        var mouseupCol = function () {
          $document.off('mousemove', mousemoveCol);
          $document.off('mouseup', mouseupCol);
        };

        // Resize column based on mouse movment
        var mousemoveCol = function (mousemoveEvent) {
          var diff = mousemoveEvent.pageX - startXOffset;
          var tableWidth = startTableWidth + diff;
          var newWidth = startWidth + diff;

          if (selectedTh && newWidth >= MIN_COL_WIDTH_IN_PX) {
            headerTable.style.width = tableWidth + 'px';
            contentTable.style.width = headerTable.offsetWidth + 'px';
            selectedTh.style.width = newWidth + 'px';
            headerCol.style.width = newWidth + 'px';
            contentCol.style.width = newWidth + 'px';

            $scope.syncDimensions(tableWidth);
          }
        };

        // Bind mousemove and mouse up events to document
        $document.on('mousemove', mousemoveCol);
        $document.on('mouseup', mouseupCol);
      };
    }

    // ***********************************************************************

    /**
     * Create table rows from $scope.rows array.
     *
     * @param  {String[]} rows Raw row data.
     * @returns {String[]}      Table rows.
     */
    function _buildRows(rows) {
      return rows.map(function (val) {
        return ['<tr>',
                '<td>',
                '<span class="truncate">',
                val.name,
                '</span>',
                '<div class="resize-grip" ng-mousedown="resizeCol($event, 0)">&nbsp;</div>',
                '</td>',
                '<td>',
                '<span class="truncate">',
                val.genres.join(', '),
                '</span>',
                '<div class="resize-grip" ng-mousedown="resizeCol($event, 1)">&nbsp;</div>',
                '</td>',
                '</tr>'].join('');
      });
    }

    // ***********************************************************************

    return {
      restrict: 'E',
      scope: {
        rows: '=',
        colNames: '=',
        onLastRow: '&?'
      },
      template: [
        '<div class="clusterize-header">',
        '  <div class="clusterize-header-hidescroll">',
        '    <table>',
        '      <colgroup>',
        '        <col ng-repeat="colName in colNames" style="width:200px">',
        '      </colgroup>',
        '      <thead class="fixed-header">',
        '        <tr>',
        '          <th ng-repeat="colName in colNames">',
        '            <span class="truncate">{{ colName }}</span>',
        '           <div class="resize-grip" ng-mousedown="resizeCol($event, $index)">&nbsp;</div>',
        '          </th>',
        '        </tr>',
        '      </thead>',
        '    </table>',
        '  </div>',
        '</div>',
        '<div class="clusterize-scroll">',
        '  <table>',
        '    <colgroup>',
        '      <col ng-repeat="colName in colNames" style="width:200px">',
        '    </colgroup>',
        '    <tbody class="clusterize-content">',
        '      <tr class="clusterize-no-data">',
        '        <td colspan=2>Loading…</td>',
        '     </tr>',
        '    </tbody>',
        '  </table>',
        '</div>',
        '</div>'
      ].join(''),
      link: _linkFn
    };
  }
}());
