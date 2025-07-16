/**
 * @generated SignedSource<<789e22be564fc2f6236d786e33e58f43>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RegisterInput = {
  email: string;
  name: string;
  password: string;
  phone?: string | null | undefined;
};
export type authRegisterMutation$variables = {
  input: RegisterInput;
};
export type authRegisterMutation$data = {
  readonly register: {
    readonly token: string;
    readonly user: {
      readonly avatarUrl: string | null | undefined;
      readonly email: string;
      readonly id: string;
      readonly name: string;
    };
  };
};
export type authRegisterMutation = {
  response: authRegisterMutation$data;
  variables: authRegisterMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "AuthPayload",
    "kind": "LinkedField",
    "name": "register",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "token",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
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
            "name": "email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "avatarUrl",
            "storageKey": null
          }
        ],
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
    "name": "authRegisterMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authRegisterMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fe5249caf37ce298d19643cc245368f3",
    "id": null,
    "metadata": {},
    "name": "authRegisterMutation",
    "operationKind": "mutation",
    "text": "mutation authRegisterMutation(\n  $input: RegisterInput!\n) {\n  register(input: $input) {\n    token\n    user {\n      id\n      email\n      name\n      avatarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "193197c47f16ea1824eac450565319f2";

export default node;
