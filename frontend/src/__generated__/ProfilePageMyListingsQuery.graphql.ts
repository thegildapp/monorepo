/**
 * @generated SignedSource<<d4ca6f003126c7a286e7cdd02fa32d3a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
export type ProfilePageMyListingsQuery$variables = Record<PropertyKey, never>;
export type ProfilePageMyListingsQuery$data = {
  readonly myInquiries: {
    readonly inquiries: ReadonlyArray<{
      readonly contactPhone: string | null | undefined;
      readonly createdAt: string;
      readonly id: string;
      readonly listing: {
        readonly city: string | null | undefined;
        readonly id: string;
        readonly images: ReadonlyArray<string>;
        readonly price: number;
        readonly state: string | null | undefined;
        readonly title: string;
      };
      readonly respondedAt: string | null | undefined;
      readonly seller: {
        readonly avatarUrl: string | null | undefined;
        readonly id: string;
        readonly name: string;
      };
      readonly status: InquiryStatus;
    }>;
    readonly totalCount: number;
  };
  readonly myListings: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"ListingCard_listing" | "SellerListingCard_listing">;
  }>;
};
export type ProfilePageMyListingsQuery = {
  response: ProfilePageMyListingsQuery$data;
  variables: ProfilePageMyListingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "price",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "images",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "city",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "type",
      "value": "SENT"
    }
  ],
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
        (v0/*: any*/),
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
          "concreteType": "Listing",
          "kind": "LinkedField",
          "name": "listing",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/),
            (v2/*: any*/),
            (v3/*: any*/),
            (v4/*: any*/),
            (v5/*: any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "seller",
          "plural": false,
          "selections": [
            (v0/*: any*/),
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "contactPhone",
          "storageKey": null
        },
        (v6/*: any*/),
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
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": "myInquiries(type:\"SENT\")"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProfilePageMyListingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "myListings",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListingCard_listing"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SellerListingCard_listing"
          }
        ],
        "storageKey": null
      },
      (v7/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProfilePageMyListingsQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Listing",
        "kind": "LinkedField",
        "name": "myListings",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "pendingInquiriesCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Inquiry",
            "kind": "LinkedField",
            "name": "inquiries",
            "plural": true,
            "selections": [
              (v0/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v7/*: any*/)
    ]
  },
  "params": {
    "cacheID": "4ba2b03b15884e0e267479ad94e31671",
    "id": null,
    "metadata": {},
    "name": "ProfilePageMyListingsQuery",
    "operationKind": "query",
    "text": "query ProfilePageMyListingsQuery {\n  myListings {\n    id\n    ...ListingCard_listing\n    ...SellerListingCard_listing\n  }\n  myInquiries(type: SENT) {\n    inquiries {\n      id\n      status\n      listing {\n        id\n        title\n        price\n        images\n        city\n        state\n      }\n      seller {\n        id\n        name\n        avatarUrl\n      }\n      contactPhone\n      createdAt\n      respondedAt\n    }\n    totalCount\n  }\n}\n\nfragment ListingCard_listing on Listing {\n  id\n  title\n  price\n  images\n  city\n  state\n  createdAt\n}\n\nfragment SellerListingCard_listing on Listing {\n  id\n  title\n  images\n  createdAt\n  pendingInquiriesCount\n  viewCount\n  inquiries {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ce9f4b43b08fdbe161ebc8edc4689689";

export default node;
