/**
 * @generated SignedSource<<3bc8c60169231ee57dbf94d4fbde3f57>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type listingsDeleteListingMutation$variables = {
  id: string;
};
export type listingsDeleteListingMutation$data = {
  readonly deleteListing: boolean;
};
export type listingsDeleteListingMutation = {
  response: listingsDeleteListingMutation$data;
  variables: listingsDeleteListingMutation$variables;
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
    "name": "listingsDeleteListingMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "listingsDeleteListingMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2adcae9fd5edf523241622fd1a66e37d",
    "id": null,
    "metadata": {},
    "name": "listingsDeleteListingMutation",
    "operationKind": "mutation",
    "text": "mutation listingsDeleteListingMutation(\n  $id: ID!\n) {\n  deleteListing(id: $id)\n}\n"
  }
};
})();

(node as any).hash = "94bcb4e07b3a872a5c686bf070a486a4";

export default node;
