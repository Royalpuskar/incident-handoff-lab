// Fictional classroom data; never use as real incident evidence.
export const scenario = Object.freeze([
  Object.freeze({id:'e1',time:'09:02',text:'A synthetic endpoint recorded five unsuccessful login attempts.',classification:'observation'}),
  Object.freeze({id:'e2',time:'09:06',text:'An analyst suggests the attempts may indicate credential guessing.',classification:'hypothesis'}),
  Object.freeze({id:'e3',time:'09:12',text:'Two independent synthetic audit records confirm a successful login after the failures.',classification:'confirmed'}),
  Object.freeze({id:'e4',time:'09:18',text:'No evidence currently identifies the person who used the account.',classification:'observation'}),
  Object.freeze({id:'e5',time:'09:22',text:'The team suspects an exposed password, but has not verified the source.',classification:'hypothesis'})
]);
