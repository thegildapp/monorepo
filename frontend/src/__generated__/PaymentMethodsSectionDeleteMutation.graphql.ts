/**
 * @generated SignedSource<<e1bc3c4b0b99a4cf7ee715c724429870>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PaymentMethodsSectionDeleteMutation$variables = {
  paymentMethodId: string;
};
export type PaymentMethodsSectionDeleteMutation$data = {
  readonly deletePaymentMethod: boolean;
};
export type PaymentMethodsSectionDeleteMutation = {
  response: PaymentMethodsSectionDeleteMutation$data;
  variables: PaymentMethodsSectionDeleteMutation$variables;
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
    "kind": "ScalarField",
    "name": "deletePaymentMethod",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PaymentMethodsSectionDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PaymentMethodsSectionDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f2fd18875fd4f8e5c1f8aeb411fba9d8",
    "id": null,
    "metadata": {},
    "name": "PaymentMethodsSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation PaymentMethodsSectionDeleteMutation(\n  $paymentMethodId: String!\n) {\n  deletePaymentMethod(paymentMethodId: $paymentMethodId)\n}\n"
  }
};
})();

(node as any).hash = "d9c963e4e66cdc259c9c1c56eee1fb90";

export default node;
