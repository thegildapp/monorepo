/**
 * @generated SignedSource<<65a99c40d56909b4ef94250878271544>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingManagementPageDeleteMutation$variables = {
  id: string;
};
export type ListingManagementPageDeleteMutation$data = {
  readonly deleteListing: boolean;
};
export type ListingManagementPageDeleteMutation = {
  response: ListingManagementPageDeleteMutation$data;
  variables: ListingManagementPageDeleteMutation$variables;
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
    "name": "deleteListing",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ListingManagementPageDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ListingManagementPageDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c9bc75df2db694e651ddcd892a0df29a",
    "id": null,
    "metadata": {},
    "name": "ListingManagementPageDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ListingManagementPageDeleteMutation(\n  $id: ID!\n) {\n  deleteListing(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "f61c511924a6c2d64f60c90d76abc4f2";

export default node;
