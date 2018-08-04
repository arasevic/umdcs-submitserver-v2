const express = require('express');
const bp = require('body-parser');

const db = require('../model');

const router = new express.Router();

// TODO: set validation middleware for model routes

// Set up CRUD routes for the model once the DB connection opens
db.connection.once('open', () => {
  router.use(crud(db.model('User'), { populate: 'courses.course' }));
  router.use(crud(db.model('Course'), { populate: 'assignments' }));
  router.use(crud(db.model('Assignment'), { 
    populate: {
      path: 'submissions',
      populate: { path: 'user' }
    }
  }));
  router.use(crud(db.model('Submission'), { populate: 'user' }));
});

/**
 * crud : Create a CRUD router for the given Mongoose model.
 *
 * `options' may include the keys:
 *   populate   -- an array of paths to populate
 *   preRead    -- middleware for find routes
 *   preCreate  -- middleware for create route
 *   preUpdate  -- middleware for update route
 *   preDelete  -- middleware for delete route
 *   noRead     -- disable find routes
 *   noCreate   -- disable create route
 *   noUpdate   -- disable update route
 *   noDelete   -- disable delete route
 * 
 * Generates the routes (for some Mongoose model `foo'):
 * - GET    /foo/:id -- findById
 * - GET    /foo     -- findAll, with query string as WHERE clause
 * - POST   /foo     -- create, with JSON body as initial VALUES
 * - PUT    /foo/:id -- update, with JSON body as changed VALUES, and
 * - DELETE /foo/:id -- destroy.
 */
function crud(model, options) {
  const router = new express.Router();
  const prefix = `/${model.modelName.toLowerCase()}`;
  const withid = `${prefix}/:id`;
  const opts = options || {};
  const create = (req, res) =>
    model.create(req.body)
         .then(doc => res.status(200).send(getOrFalse(doc)));
  const findById = (req, res) =>
    (opts.populate 
     ? model.findById(req.params.id).populate(opts.populate)
     : model.findById(req.params.id))
        .then(doc => res.status(200).send(getOrFalse(doc)));
  const findAll = (req, res) =>
    (opts.populate 
     ? model.find(req.query).populate(opts.populate)
     : model.find(req.query))
        .then(docs => res.status(200).send(docs.map(getOrFalse)));
  const update = (req, res) =>
    model.updateOne({ _id: req.params.id }, req.body)
         .then(succ => findById(req, res));
  const destroy = async (req, res) =>
    model.remove(req.body)
         .then(succ => res.sendStatus(200));
  if (!Boolean(opts.noRead))
    router.get(prefix, opts.preRead || [], findAll);
  if (!Boolean(opts.noRead))
    router.get(withid, opts.preRead || [], findById);
  if (!Boolean(opts.noCreate))
    router.post(prefix, bp.json(), opts.preCreate || [], create);
  if (!Boolean(opts.noUpdate))
    router.put(withid, bp.json(), opts.preUpdate || [], update);
  if (!Boolean(opts.noDelete))
    router.delete(withid, opts.preDelete || [], destroy);
  return router;
}

// respond with the JSON document or false
function getOrFalse(maybeInst) {
  return Boolean(maybeInst) && maybeInst.toJSON();
}

module.exports = router;
