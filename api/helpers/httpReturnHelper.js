exports.error = function(res, err){
  return res.status(440).json({error: err});
}

exports.success = function(res, msg, objReturn){
  return res.json({ message: msg, obj: objReturn });
}
