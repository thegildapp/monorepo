/**
 * @generated SignedSource<<acd17c3a0c119149da84a4b10255ade8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type passkeyDeleteMutation$variables = {
  id: string;
};
export type passkeyDeleteMutation$data = {
  readonly deletePasskey: boolean;
};
export type passkeyDeleteMutation = {
  response: passkeyDeleteMutation$data;
  variables: passkeyDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "kind": "ScalarField",
    "name": "deletePasskey",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "passkeyDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "passkeyDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f5973857d8d192043666c7a3fe044089",
    "id": null,
    "metadata": {},
    "name": "passkeyDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation passkeyDeleteMutation(\n  $id: ID!\n) {\n  deletePasskey(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "5b881a8da3ba632e697e2ca942011130";

export default node;
