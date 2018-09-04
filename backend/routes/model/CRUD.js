const express = require('express');
const bp = require('body-parser');
const Sequelize = require('sequelize');
const util = require('../../util');

// Operations supported for query string WHERE clauses
const OPS = ['!', '<', '>'];
const isOp = val => val.length > 1 && OPS.includes(val[0]);

/**
 * Create a CRUD router for the given sequelize model.
 *
 * `options' may include the keys:
 *   create     -- options passed to model.create
 *   read       -- options passed to model.find{One,All}
 *   update     -- options passed to model.update
 *   delete     -- options passed to model.destroy
 *   preRead    -- middleware for find routes
 *   preCreate  -- middleware for create route
 *   preUpdate  -- middleware for update route
 *   preDelete  -- middleware for delete route
 *   postRead   -- modify a successful read document before response
 *   noRead     -- disable find routes
 *   noCreate   -- disable create route
 *   noUpdate   -- disable update route
 *   noDelete   -- disable delete route
 * 
 * Generates the routes (for some Sequelize model `foo'):
 * - GET    /foo/:id -- findById
 * - GET    /foo     -- findAll, with query string as WHERE clause
 * - POST   /foo     -- create, with JSON body as initial VALUES
 * - PUT    /foo/:id -- update, with JSON body as changed VALUES, and
 * - DELETE /foo/:id -- destroy.
 *
 * Query strings support the following operations:
 *   /foo?id=!null          =>  { where: {   id: { [Op.ne]: null } } }
 *   /foo?date=<2018-08-12  =>  { where: { date: { [Op.lt]: 2018-08-12 } } }
 *   /foo?num=>42           =>  { where: {  num: { [Op.gt]: 42 } } }
 */
function CRUD(model, options) {
  const postRead = options.postRead || (doc => doc);
  const create = async (req, res) =>
    model.create(req.body, options.create)
        .then(inst => res.status(200).send(getOrFalse(inst)))
        .catch(error(res));
  const findById = async (req, res) =>
    model.findOne({ ...findOpts(options.read), where: { id: req.params.id } })
        .then(async inst => {
          const doc = await postRead(getOrFalse(inst), req);
          res.status(200).send(doc);
        })
        .catch(error(res));
  const findAll = async (req, res) =>
    model.findAll({ ...findOpts(options.read), ...parseQuery(req.query) })
        .then(insts => res.status(200).send(
          insts.map(async doc => await postRead(getOrFalse(doc), req))
            .filter(doc => doc)))
        .catch(error(res));
  const update = async (req, res) =>
    model.update(req.body, { ...options.update, where: { id: req.params.id } })
        .then(rows => findById(req, res))
        .catch(error(res));
  const destroy = async (req, res) =>
    model.destroy({ where: { id: req.params.id }, ...options.delete })
        .then(inst => res.sendStatus(200)).catch(error(res));
  const router = new express.Router();
  const prefix = `/${model.name.toLowerCase()}`;
  const withid = `${prefix}/:id`;
  const middle = options.middleware || [];
  if (!options.noRead)
    router.get(prefix, options.preRead || [], findAll);
  if (!options.noRead)
    router.get(withid, options.preRead || [], findById);
  if (!options.noCreate)
    router.post(prefix, bp.json(), options.preCreate || [], create);
  if (!options.noUpdate)
    router.put(withid, bp.json(), options.preUpdate || [], update);
  if (!options.noDelete)
    router.delete(withid, options.preDelete || [], destroy);
  return router;
}

const metadata = [ 'createdAt', 'updatedAt', 'deletedAt' ];

// Exclude metadata attributes by default
function findOpts(opts) {
  return { attributes: { exclude: metadata }, ...opts };
}

// respond with the JSON of a model instance or false
function getOrFalse(maybeInst) {
  return maybeInst && maybeInst.get({ plain: true });
}

// respond after an error occurs
function error(res) {
  return err => {
    console.log('CRUD -- Error while responding:');
    console.log(err);
    res.status(500).json(err);
  };
}

// parse a query string as the WHERE clause to a findAll request
function parseQuery(query) {
  // parse query string Op-prefixed values
  function parseOp(opval) {
    var op;
    switch (opval[0]) {
    case '!': op = Sequelize.Op.ne; break;
    case '<': op = Sequelize.Op.lt; break;
    case '>': op = Sequelize.Op.gt; break;
    default: throw new Error(`Unhandled Op in query string: {opval[0]}`);
    }
    return { [op]: parseValue(opval.slice(1)) };
  }
  // parse query string values
  function parseValue(val) {
    const int =  parseInt(val);
    if    (!isNaN(int)) return int;
    else if (isOp(val)) return parseOp(val);
    else switch(val) {
      case 'null': return null;
      case false:  return false;
      case true:   return true;
      default:     return val;
    }
  }
  return { where: util.mapObj(query, parseValue) };
}

module.exports = CRUD;
