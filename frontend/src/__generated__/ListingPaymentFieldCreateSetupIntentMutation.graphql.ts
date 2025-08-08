/**
 * @generated SignedSource<<121d01be7f97b836d640b75ed1b465ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingPaymentFieldCreateSetupIntentMutation$variables = Record<PropertyKey, never>;
export type ListingPaymentFieldCreateSetupIntentMutation$data = {
  readonly createSetupIntent: {
    readonly clientSecret: string;
    readonly customerId: string;
  };
};
export type ListingPaymentFieldCreateSetupIntentMutation = {
  response: ListingPaymentFieldCreateSetupIntentMutation$data;
  variables: ListingPaymentFieldCreateSetupIntentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "SetupIntent",
    "kind": "LinkedField",
    "name": "createSetupIntent",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientSecret",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "customerId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ListingPaymentFieldCreateSetupIntentMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ListingPaymentFieldCreateSetupIntentMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b67ad6aed99db2f6176373f1515590c5",
    "id": null,
    "metadata": {},
    "name": "ListingPaymentFieldCreateSetupIntentMutation",
    "operationKind": "mutation",
    "text": "mutation ListingPaymentFieldCreateSetupIntentMutation {\n  createSetupIntent {\n    clientSecret\n    customerId\n  }\n}\n"
  }
};
})();

(node as any).hash = "f1d5c4aef0f6e981a343b374cffb68ba";

export default node;
