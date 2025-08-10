/**
 * @generated SignedSource<<5b3431decd638206bb933bc5f6734142>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ListingPaymentFieldSavePaymentMethodMutation$variables = {
  paymentMethodId: string;
};
export type ListingPaymentFieldSavePaymentMethodMutation$data = {
  readonly savePaymentMethod: {
    readonly brand: string;
    readonly expMonth: number;
    readonly expYear: number;
    readonly id: string;
    readonly isDefault: boolean;
    readonly last4: string;
  };
};
export type ListingPaymentFieldSavePaymentMethodMutation = {
  response: ListingPaymentFieldSavePaymentMethodMutation$data;
  variables: ListingPaymentFieldSavePaymentMethodMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "paymentMethodId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "paymentMethodId",
        "variableName": "paymentMethodId"
      }
    ],
    "concreteType": "PaymentMethod",
    "kind": "LinkedField",
    "name": "savePaymentMethod",
    "plural": false,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ListingPaymentFieldSavePaymentMethodMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ListingPaymentFieldSavePaymentMethodMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "21544655c036401e02e35f82f3dc7be2",
    "id": null,
    "metadata": {},
    "name": "ListingPaymentFieldSavePaymentMethodMutation",
    "operationKind": "mutation",
    "text": "mutation ListingPaymentFieldSavePaymentMethodMutation(\n  $paymentMethodId: String!\n) {\n  savePaymentMethod(paymentMethodId: $paymentMethodId) {\n    id\n    brand\n    last4\n    expMonth\n    expYear\n    isDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "e7e99cedada9663af1839d3afddec254";

export default node;
