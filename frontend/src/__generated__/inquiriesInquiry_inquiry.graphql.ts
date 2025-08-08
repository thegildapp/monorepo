/**
 * @generated SignedSource<<edbe2d2d333b398e8a92ac5d1d01c76c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type InquiryStatus = "ACCEPTED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type inquiriesInquiry_inquiry$data = {
  readonly buyer: {
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
  readonly " $fragmentType": "inquiriesInquiry_inquiry";
};
export type inquiriesInquiry_inquiry$key = {
  readonly " $data"?: inquiriesInquiry_inquiry$data;
  readonly " $fragmentSpreads": FragmentRefs<"inquiriesInquiry_inquiry">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "inquiriesInquiry_inquiry",
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
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "buyer",
      "plural": false,
      "selections": (v1/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "seller",
      "plural": false,
      "selections": (v1/*: any*/),
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
  "type": "Inquiry",
  "abstractKey": null
};
})();

(node as any).hash = "5a92434b6c43061bb45ee7e97564e284";

export default node;
