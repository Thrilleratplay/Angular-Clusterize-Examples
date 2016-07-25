/**
 * Basic Angular.js Clusterize.js example
 */
(function () {
  'use strict';

  // Directive declaration
  angular.module('angularClusterize', [])
         .directive('angularClusterize', ['$compile', '$timeout', _angularClusterize]);

  function _angularClusterize($compile, $timeout) {
    /**
     * AngularClusterize directive link
     *
     * @param  {Object} $scope Directive scope
     * @param  {Object} $elem   Directive element
     * @param  {Object} $attr   Directive element attributes
     * @param  {Object} $ctrl   Directive controller
     */
    function _linkFn($scope, $elem, $attr, $ctrl) {
      // Clusterize elements
      var scrollEl =  $elem[0].querySelector('.clusterize-scroll');
      var contentEl = $elem[0].querySelector('.clusterize-content');

      // init clusterize
      var clusterize = new Clusterize({
        rows: _buildRows($scope.rows),
        scrollElem: scrollEl,
        contentElem: contentEl,
      });

      clusterize.html = function (data) {
        contentEl.innerHTML = data;

        // Update rendered rows
        $compile(contentEl)($scope);
      };

      // HACK: This is needed to correctly bind angular when first loaded
      $timeout(function () {
        $compile(contentEl)($scope);
      });

      // watch for changes and update
      $scope.$watch('rows.length', function () {
        clusterize.update(_buildRows($scope.rows));
      });
    }

    // ***********************************************************************

    /**
     * Create table rows from $scope.rows array
     * @param  {String[]} rows Raw row data
     * @return {String[]}      Table rows
     */
    function _buildRows(rows) {
      return rows.map(function (val) {
        return '<tr><td ng-click="clickme(' + val + ')">' + val + '</td></tr>';
      });
    }

    // ***********************************************************************

    return {
        restrict: 'E',
        template: ['<table>',
            '<thead></thead>',
            '</table>',
            '<div class="clusterize-scroll">',
            '<table>',
            '<tbody class="clusterize-content">',
            '<tr class="clusterize-no-data">',
            '<td>Loading data…</td>',
            '</tr>',
            '</tbody>',
            '</table>',
            '</div>',
          ].join(''),
        link: _linkFn,
      };
  }
})();
