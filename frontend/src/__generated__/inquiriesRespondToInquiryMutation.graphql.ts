/**
 * @generated SignedSource<<a475279cd5f8ed032104d2d3ae291a47>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
export type inquiriesRespondToInquiryMutation$variables = {
  accept: boolean;
  inquiryId: string;
};
export type inquiriesRespondToInquiryMutation$data = {
  readonly respondToInquiry: {
    readonly errors: ReadonlyArray<{
      readonly field: string | null | undefined;
      readonly message: string;
    }> | null | undefined;
    readonly inquiry: {
      readonly contactPhone: string | null | undefined;
      readonly id: string;
      readonly respondedAt: string | null | undefined;
      readonly status: InquiryStatus;
    } | null | undefined;
  };
};
export type inquiriesRespondToInquiryMutation = {
  response: inquiriesRespondToInquiryMutation$data;
  variables: inquiriesRespondToInquiryMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accept"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inquiryId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "accept",
        "variableName": "accept"
      },
      {
        "kind": "Variable",
        "name": "inquiryId",
        "variableName": "inquiryId"
      }
    ],
    "concreteType": "RespondToInquiryPayload",
    "kind": "LinkedField",
    "name": "respondToInquiry",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Inquiry",
        "kind": "LinkedField",
        "name": "inquiry",
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
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "contactPhone",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "respondedAt",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "FieldError",
        "kind": "LinkedField",
        "name": "errors",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "field",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "inquiriesRespondToInquiryMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "inquiriesRespondToInquiryMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2d1b01f989c6f6b7b9ae226c00598a6c",
    "id": null,
    "metadata": {},
    "name": "inquiriesRespondToInquiryMutation",
    "operationKind": "mutation",
    "text": "mutation inquiriesRespondToInquiryMutation(\n  $inquiryId: ID!\n  $accept: Boolean!\n) {\n  respondToInquiry(inquiryId: $inquiryId, accept: $accept) {\n    inquiry {\n      id\n      status\n      contactPhone\n      respondedAt\n    }\n    errors {\n      field\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "351735cfba1d6fdb61f1fb4492976599";

export default node;
