import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { DepartmentsCollection } from './DepartmentsCollection';
import { PositionsCollection } from './PositionsCollection';

export const StaffCollection = new Mongo.Collection('StaffCollection');

if (Meteor.isServer) {
  Meteor.publish('StaffCollection', () => StaffCollection.find());

  StaffCollection.allow({
    insert() { return false; },
    update() { return false; },
    remove() { return false; },
  });

  StaffCollection.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
  });

  Meteor.methods({
    'staff.insert': function (newStaff) {
      newStaff.createdAt = new Date();
      newStaff.createdBy = Meteor.userId();
      newStaff.active = true;

      const staffId = StaffCollection.insert(newStaff);

      DepartmentsCollection.update(
        { _id: newStaff.deptId },
        {
          $inc: { counter: 1 },
          $push: { staff: staffId },
        },
      );

      PositionsCollection.update(
        { _id: newStaff.posId },
        {
          $inc: { counter: 1 },
          $push: { staff: staffId },
        },
      );

      return staffId;
    },
    'staff.delete': function (staffId) {
      return StaffCollection.update({ _id: staffId }, {
        $set: {
          active: false,
        },
      });
    },
  });
}

