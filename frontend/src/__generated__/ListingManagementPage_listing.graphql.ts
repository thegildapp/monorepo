/**
 * @generated SignedSource<<e5a5e3e66952ea6d3e6883e6df6e8d58>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ListingManagementPage_listing$data = {
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly inquiries: ReadonlyArray<{
    readonly buyer: {
      readonly avatarUrl: string | null | undefined;
      readonly id: string;
      readonly name: string;
    };
    readonly contactPhone: string | null | undefined;
    readonly createdAt: string;
    readonly id: string;
    readonly listing: {
      readonly id: string;
      readonly title: string;
    };
    readonly respondedAt: string | null | undefined;
    readonly seller: {
      readonly id: string;
      readonly name: string;
    };
    readonly status: InquiryStatus;
  }> | null | undefined;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly status: ListingStatus;
  readonly title: string;
  readonly viewCount: number;
  readonly " $fragmentType": "ListingManagementPage_listing";
};
export type ListingManagementPage_listing$key = {
  readonly " $data"?: ListingManagementPage_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListingManagementPage_listing">;
};

const node: ReaderFragment = (function(){
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
  "name": "createdAt",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListingManagementPage_listing",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "price",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "images",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "city",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    (v2/*: any*/),
    (v3/*: any*/),
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
        (v0/*: any*/),
        (v3/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "buyer",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v4/*: any*/),
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
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "seller",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v4/*: any*/)
          ],
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
            (v1/*: any*/)
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
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "respondedAt",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Listing",
  "abstractKey": null
};
})();

(node as any).hash = "f2275a9bd00ea3d74733abdaed7c350c";

export default node;
