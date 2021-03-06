'use strict';
var models = require('../../models');
var _ = require('lodash');

var proto = module.exports = function (){
  function Collaborators() {

  }
  Collaborators.__proto__ = proto;
  return Collaborators;
};

proto.listCollaborators = function (appId) {
  return models.Collaborators.findAll({where: {appid: appId}})
  .then(function (data) {
    return _.reduce(data, function(result, value, key) {
      (result['uids'] || (result['uids'] = [])).push(value.uid);
      result[value.uid] = value;
      return result;
    }, []);
  })
  .then(function (coInfo) {
    return models.Users.findAll({where: {id: {in: coInfo.uids}}})
    .then(function (data2) {
      return _.reduce(data2, function (result, value, key) {
        var permission = "";
        if (!_.isEmpty(coInfo[value.id])) {
          permission = coInfo[value.id].roles;
        }
        result[value.email] = {permission: permission};
        return result;
      }, {});
    });
  });
};

proto.addCollaborator = function (appId, uid) {
  return models.Collaborators.findOne({where: {appid: appId, uid: uid}})
  .then(function (data) {
    if (_.isEmpty(data)){
      return models.Collaborators.create({
        appid: appId,
        uid: uid,
        roles: "Collaborator"
      });
    }else {
      throw new Error('user aleady is Collaborator.');
    }
  });
};

proto.deleteCollaborator = function (appId, uid) {
  return models.Collaborators.findOne({where: {appid: appId, uid: uid}})
  .then(function (data) {
    if (_.isEmpty(data)){
      throw new Error('user is not a Collaborator');
    }else {
      return models.Collaborators.destroy({where: {id: data.id}});
    }
  });
};
