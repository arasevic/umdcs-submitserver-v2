const express = require('express');
const multer = require('multer');
const fs = require('fs');

const { getCookie } = require('../auth/cookies');
const roles = require('../auth/roles');
const val = require('../auth/validate');
const db = require('../models');


/**
 * Students may only upload submissions to visible assignments in
 * their courses. TAs and Profs may upload submissions to any
 * assignments in their courses.
 */
const canUpload = (req, res, k) => {
  const cookie = getCookie(req);
  const { cid, aid } = req.params;
  if (val.authorized(cookie, roles.student, cid)) {
    db.assignment.findOne({ where: { id: aid } })
      .then(a => {
        if (a.visible || val.authorized(cookie, roles.ta, cid)) {
          k();
        } else {
          res.sendStatus(403);
        }
      }).catch(err => {
        console.log('error while validating upload', err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(403);
  }
};

/**
 * Handles temporary storage for a multi-part file upload.
 */
const upload = multer({ storage: multer.diskStorage({
  destination: process.env.SUBMIT_DIR,
  /**
   * Save uploaded file with the course, assignment, and user IDs, and
   * current time. Expects URL params `cid', `aid', and pulls the user
   * ID from the session cookie.
   */
  filename: (req, file, k) => {
    const cookie = getCookie(req);
    const { cid, aid } = req.params;
    const path = `${cid}-${aid}-${cookie.id}-${Date.now()}.zip`;
    k(null, path);
  },
})});

/**
 * Store the uploaded file in the DB
 */
const persist = (req, res) => {
  fs.readFile(req.file.path, (err, data) => {
    if (err) {
      res.sendStatus(500);
    } else {
      const cookie = getCookie(req);
      const { aid } = req.params;
      db.submission.create({
        userId: cookie.id,
        assignmentId: aid,
        submitted: new Date(),
        input: data
      }).then(() => fs.unlink(`./${req.file.path}`, err => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.sendStatus(201);
        }
      })).catch(err => res.sendStatus(500));
    }
  });
};

/**
 * Students may only download their own submissions. TAs and Profs may
 * download any submissions from their courses.
 */
const canDownload = async (req, res, k) => {
  const cookie = getCookie(req);
  const { cid, aid, sid } = req.params;
  if (val.authorized(cookie, roles.student, cid)) {
    console.log('Is student!');
    try {
      const s = await db.submission.findOne({ where: { id: sid } });
      console.log('found sub:', s);
      if (s.userId === cookie.id || val.authorized(cookie, roles.ta, cid)) {
        console.log('downloading!');
        k();
      } else {
        console.log('not downloading!');
        res.sendStatus(403);
      }
    } catch (err) {
      console.log('Error occurred while verifying download:', err);
      res.sendStatus(404);
    }
  } else {
    console.log('Is NOT student!', cid, aid, sid);
    res.sendStatus(403);
  }
};

/**
 * Send the submitted file to the client. The submission `id' must be
 * given as a request URL parameter.
 */
const download = (req, res) => {
  const { sid } = req.params;
  db.submission.findOne({ where: { id: sid } }).then(sub => {
    const { input } = sub;
    //res.set('Content-Type', 'application/zip');
    res.status(200).send(input);
  }).catch(err => {
    res.sendStatus(500);
  });
};

const router = new express.Router();

router.post('/submit/:cid/:aid', canUpload, upload.single('file'), persist);
router.get('/submit/:cid/:aid/:sid', canDownload, download);

module.exports = router;
