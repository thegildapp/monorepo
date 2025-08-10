/**
 * @generated SignedSource<<baca6a5cbb17cc2559ce8279d70799f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingPaymentFieldQuery$variables = Record<PropertyKey, never>;
export type ListingPaymentFieldQuery$data = {
  readonly myPaymentMethods: ReadonlyArray<{
    readonly brand: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly id: string;
    readonly isDefault: boolean;
    readonly last4: string;
  }>;
};
export type ListingPaymentFieldQuery = {
  response: ListingPaymentFieldQuery$data;
  variables: ListingPaymentFieldQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PaymentMethod",
    "kind": "LinkedField",
    "name": "myPaymentMethods",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "brand",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "last4",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "expMonth",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "expYear",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "isDefault",
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
    "name": "ListingPaymentFieldQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ListingPaymentFieldQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "adab7f4f99517f07d3a3abeb314fe2b6",
    "id": null,
    "metadata": {},
    "name": "ListingPaymentFieldQuery",
    "operationKind": "query",
    "text": "query ListingPaymentFieldQuery {\n  myPaymentMethods {\n    id\n    brand\n    last4\n    expMonth\n    expYear\n    isDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d99252c7b170e7c761eb9edebe69a78";

export default node;
