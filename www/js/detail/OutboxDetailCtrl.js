// Cache Detail Module
angular.module('snapcache.detail.outbox', [])

// Detail controller
<<<<<<< HEAD
.controller('OutboxDetailCtrl', function (userSession, Caches, Camera, Cloudinary, $ionicLoading) {
=======
.controller('OutboxDetailCtrl', function ($scope, $ionicModal, userSession, Caches) {
>>>>>>> (feat) Add bare bones modal for selecting additional contributors
  var self = this;
  self.cache = userSession.currentCache;
  self.items = [];
  self.isContributable = (Date.now() < self.cache.droptime);
  self.contentToAdd = {};

  // Load the cache's objects into an array
  // NOTE: Currently, the assumed object structure is the following:
  //  - CacheID
  //    - contents
  //        - ContributionID
  //          - contributor
  //          - content
  //            - type
  //            - value specific to type
  var items = self.cache.contents;
  for (var id in items) {
    self.items.push(items[id]);
  }

  // `addContent()` will take the content of an additional message that the user
  // wants to contribute to the cache, add it, and save it to Firebase.
  self.addContent = function() {
    var type = '';
    var message = '';
    var contribution = {
      contributor: userSession.name,
      content: {}
    };

    // Set contribution's type based on user-submitted content
    if (self.contentToAdd.imgURL) {
      contribution.content.type = 'image';
      contribution.content.imgURL = self.contentToAdd.imgURL;
    } else {
      contribution.content.type = 'text';
    }

    // Set message on content only if user has added text
    if (self.contentToAdd.text) {
      contribution.content.message = self.contentToAdd.text;
    }

    console.log('CONTRIBUTION');
    console.dir(contribution);

    // Push the added message into the texts array so that the view
    // dynamically updates.
    self.items.push(contribution);

    // Need to also add it to the cache, so that the view will remain consistent
    // as the user switches in and out of the outbox detail.
      // NOTE: We just use a random id to replicate the structure that Firebase
      // uses. This should be fine for the case where the user logs in.
    self.cache.contents[Math.random()] = contribution;

    // Send the additional cache contribution to Firebase.
    Caches.addContribution(self.cache._id, contribution);

    // Remove the user input
    self.contentToAdd = {};
  };

  // 'getPhoto()' opens the camera for picture taking and ...
  self.getPhoto = function () {
    console.log('GET PHOTO');
    Camera.getPicture({
      destinationType: navigator.camera.DestinationType.DATA_URL,
      targetHeight: 1500,
      targetWidth: 1500,
      quality: 25 // set below 50 to avoid iOS memory errors
    })
    .then(
      function (image) {
        self.showLoading('Uploading...');
        Cloudinary.uploadImage(image)
          .success(function (response) {
            console.log('SUCCESSFUL POST TO CLOUDINARY');
            self.hideLoading();
            self.contentToAdd.imgURL = response.url; // could be secure_url if we need https

          }).error(function(error) {
            console.log('ERROR POSTING TO CLOUDINARY');
            console.error('getPhoto error', error);

            self.hideLoading();
          });
      },
      function (error) {
        self.hideLoading();
        console.error('getPhoto error', error);
      });
  };

  self.showLoading = function(message) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><div style="margin-top:5px">'+message+'</div>'
    });
  };

  self.hideLoading = function(){
    $ionicLoading.hide();
  };

  // Creating the modal associated with forwarding the cache to other
  // contributors.
  $ionicModal.fromTemplateUrl('js/detail/outboxForward.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function(modal){
    self.forwardModal = modal;
  });

  self.openForward = function() {
    self.forwardModal.show();
  };

  self.closeForward = function() {
    self.forwardModal.hide();
  };

  $scope.$on('$destroy', function(){
    self.forwardModal.remove();
  });
});
