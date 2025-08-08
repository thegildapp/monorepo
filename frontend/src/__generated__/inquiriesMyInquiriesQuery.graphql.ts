/**
 * @generated SignedSource<<b973eec2a1eebc86247a55d896ce658a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
export type InquiryType = "RECEIVED" | "SENT" | "%future added value";
export type inquiriesMyInquiriesQuery$variables = {
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  status?: InquiryStatus | null | undefined;
  type: InquiryType;
};
export type inquiriesMyInquiriesQuery$data = {
  readonly myInquiries: {
    readonly hasMore: boolean;
    readonly inquiries: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"inquiriesInquiry_inquiry">;
    }>;
    readonly totalCount: number;
  };
};
export type inquiriesMyInquiriesQuery = {
  response: inquiriesMyInquiriesQuery$data;
  variables: inquiriesMyInquiriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "status"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "type"
},
v4 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "status",
    "variableName": "status"
  },
  {
    "kind": "Variable",
    "name": "type",
    "variableName": "type"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hasMore",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  (v7/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "inquiriesMyInquiriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "InquiryConnection",
        "kind": "LinkedField",
        "name": "myInquiries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Inquiry",
            "kind": "LinkedField",
            "name": "inquiries",
            "plural": true,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "inquiriesInquiry_inquiry"
              }
            ],
            "storageKey": null
          },
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "inquiriesMyInquiriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "InquiryConnection",
        "kind": "LinkedField",
        "name": "myInquiries",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Inquiry",
            "kind": "LinkedField",
            "name": "inquiries",
            "plural": true,
            "selections": [
              (v7/*: any*/),
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
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "buyer",
                "plural": false,
                "selections": (v8/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "seller",
                "plural": false,
                "selections": (v8/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Listing",
                "kind": "LinkedField",
                "name": "listing",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
                    "storageKey": null
                  }
                ],
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
                "name": "createdAt",
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
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9341c51b3a41eddee8731e52feb71d41",
    "id": null,
    "metadata": {},
    "name": "inquiriesMyInquiriesQuery",
    "operationKind": "query",
    "text": "query inquiriesMyInquiriesQuery(\n  $type: InquiryType!\n  $status: InquiryStatus\n  $limit: Int\n  $offset: Int\n) {\n  myInquiries(type: $type, status: $status, limit: $limit, offset: $offset) {\n    inquiries {\n      ...inquiriesInquiry_inquiry\n      id\n    }\n    totalCount\n    hasMore\n  }\n}\n\nfragment inquiriesInquiry_inquiry on Inquiry {\n  id\n  status\n  buyer {\n    id\n    name\n  }\n  seller {\n    id\n    name\n  }\n  listing {\n    id\n    title\n  }\n  contactPhone\n  createdAt\n  respondedAt\n}\n"
  }
};
})();

(node as any).hash = "472941d84fa1681aa42b30cc446b8e97";

export default node;
