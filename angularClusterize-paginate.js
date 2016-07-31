/* global Clusterize */

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
    function _linkFn($scope, $elem) {
      // Clusterize elements
      var scrollEl = $elem[0].querySelector('.clusterize-scroll');
      var contentEl = $elem[0].querySelector('.clusterize-content');
      var headerEl = $elem[0].querySelector('.clusterize-header');

      // init clusterize
      var clusterize = new Clusterize({
        rows: _buildRows($scope.rows),
        scrollElem: scrollEl,
        contentElem: contentEl
      });

      // Override Clusterize.js html function
      clusterize.html = function (data) {
        contentEl.innerHTML = data;

        // Update rendered rows
        $compile(contentEl)($scope);
        $scope.syncWidth();
      };

      // HACK: This is needed to correctly bind angular when first loaded
      $timeout(function () {
        $compile(contentEl)($scope);
      });

      // watch for changes and update
      $scope.$watch('rows.length', function () {
        clusterize.update(_buildRows($scope.rows));
      });

      // Watch scroll
      angular.element(scrollEl).on('scroll', function () {
        // Fires on last row
        if (scrollEl.scrollTop >= scrollEl.scrollHeight - scrollEl.clientHeight
        && angular.isFunction($scope.onLastRow)) {
          $scope.$applyAsync($scope.onLastRow);
        }
      });

      // Set header width to content's scroll width
      $scope.syncWidth = function () {
        headerEl.style.width = scrollEl.clientWidth + 'px';
      };
    }

    // ***********************************************************************

    /**
     * Create table rows from $scope.rows array
     * @param  {String[]} rows Raw row data
     * @return {String[]}      Table rows
     */
    function _buildRows(rows) {
      return rows.map(function (val) {
        return '<tr><td>' + val.name + '</td><td>' + val.genres.join(', ') + '</td></tr>';
      });
    }

    // ***********************************************************************

    return {
      restrict: 'E',
      scope: {
        rows: '=',
        headers: '=',
        onLastRow: '&?'
      },
      template: [
        '<div class="clusterize-header">',
        '<table>',
        '<thead><tr>',
        '<th ng-repeat="header in headers">{{ header }}</th>',
        '</tr></thead>',
        '</table>',
        '</div>',
        '<div class="clusterize-scroll">',
        '<table>',
        '<tbody class="clusterize-content">',
        '<tr class="clusterize-no-data">',
        '<td>Loading data…</td>',
        '</tr>',
        '</tbody>',
        '</table>',
        '</div>'
      ].join(''),
      link: _linkFn
    };
  }
}());
