/**
 * @generated SignedSource<<46b0b2d2790147d1cfece9d26e957758>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PaymentMethodsSectionQuery$variables = Record<PropertyKey, never>;
export type PaymentMethodsSectionQuery$data = {
  readonly myPaymentMethods: ReadonlyArray<{
    readonly brand: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly id: string;
    readonly isDefault: boolean;
    readonly last4: string;
  }>;
};
export type PaymentMethodsSectionQuery = {
  response: PaymentMethodsSectionQuery$data;
  variables: PaymentMethodsSectionQuery$variables;
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
    "name": "PaymentMethodsSectionQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PaymentMethodsSectionQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "344d3e1f1f86e93f695225b8f1b513da",
    "id": null,
    "metadata": {},
    "name": "PaymentMethodsSectionQuery",
    "operationKind": "query",
    "text": "query PaymentMethodsSectionQuery {\n  myPaymentMethods {\n    id\n    brand\n    last4\n    expMonth\n    expYear\n    isDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "9e582e1009dcdec1773f750e3e1b0423";

export default node;
