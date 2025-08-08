/**
 * @generated SignedSource<<e2cc460bfb6798f203ffc07b139e7fb9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SellerListingCard_listing$data = {
  readonly createdAt: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly inquiries: ReadonlyArray<{
    readonly id: string;
  }> | null | undefined;
  readonly pendingInquiriesCount: number | null | undefined;
  readonly title: string;
  readonly viewCount: number;
  readonly " $fragmentType": "SellerListingCard_listing";
};
export type SellerListingCard_listing$key = {
  readonly " $data"?: SellerListingCard_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"SellerListingCard_listing">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SellerListingCard_listing",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
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
      "name": "createdAt",
      "storageKey": null
    },
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
  "type": "Listing",
  "abstractKey": null
};
})();

(node as any).hash = "e87054136d518f1ad4f32a5b5ba900fa";

export default node;
