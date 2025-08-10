/**
 * @generated SignedSource<<38e0df918445610e8eaabcdbbba99845>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PaymentMethodsSectionSetDefaultMutation$variables = {
  paymentMethodId: string;
};
export type PaymentMethodsSectionSetDefaultMutation$data = {
  readonly setDefaultPaymentMethod: {
    readonly id: string;
    readonly isDefault: boolean;
  };
};
export type PaymentMethodsSectionSetDefaultMutation = {
  response: PaymentMethodsSectionSetDefaultMutation$data;
  variables: PaymentMethodsSectionSetDefaultMutation$variables;
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
    "name": "setDefaultPaymentMethod",
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
    "name": "PaymentMethodsSectionSetDefaultMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PaymentMethodsSectionSetDefaultMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "33bf3b1071c76226806e8907be3ee32d",
    "id": null,
    "metadata": {},
    "name": "PaymentMethodsSectionSetDefaultMutation",
    "operationKind": "mutation",
    "text": "mutation PaymentMethodsSectionSetDefaultMutation(\n  $paymentMethodId: String!\n) {\n  setDefaultPaymentMethod(paymentMethodId: $paymentMethodId) {\n    id\n    isDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "1862b3af1d6e5f0ff76a8e742fe6f005";

export default node;
