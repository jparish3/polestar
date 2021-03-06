'use strict';

angular.module('vleApp')
  .controller('MainCtrl', function($scope, $document, Spec, Dataset, Config, consts, Chronicle, Logger, Bookmarks) {
    $scope.Spec = Spec;
    $scope.Dataset = Dataset;
    $scope.Config = Config;
    $scope.Logger = Logger;
    $scope.Bookmarks = Bookmarks;
    $scope.consts = consts;
    $scope.showDevPanel = false;

    // undo/redo support

    $scope.canUndo = false;
    $scope.canRedo = false;

    // bookmark
    $scope.showBookmark = false;
    $scope.hideBookmark = function() {
      $scope.showBookmark = false;
    };

    // load bookmarks from local storage
    Bookmarks.load();

    // initialize undo after we have a dataset
    Dataset.update(Dataset.dataset).then(function() {
      Config.updateDataset(Dataset.dataset);

      $scope.chron = Chronicle.record('Spec.spec', $scope, true,
        ['Dataset.dataset', 'Dataset.dataschema','Dataset.stats', 'Config.config']);

      $scope.canUndoRedo = function() {
        $scope.canUndo = $scope.chron.canUndo();
        $scope.canRedo = $scope.chron.canRedo();
      };
      $scope.chron.addOnAdjustFunction($scope.canUndoRedo);
      $scope.chron.addOnUndoFunction($scope.canUndoRedo);
      $scope.chron.addOnRedoFunction($scope.canUndoRedo);

      $scope.chron.addOnUndoFunction(function() {
        Logger.logInteraction(Logger.actions.UNDO);
      });
      $scope.chron.addOnRedoFunction(function() {
        Logger.logInteraction(Logger.actions.REDO);
      });

      angular.element($document).on('keydown', function(e) {
        if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          $scope.chron.undo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Y'.charCodeAt(0) && (e.ctrlKey || e.metaKey)) {
          $scope.chron.redo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && e.shiftKey) {
          $scope.chron.redo();
          $scope.$digest();
          return false;
        }
      });
    });
  });
