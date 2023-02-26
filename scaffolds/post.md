---
title: This is the title of your post added also as a meta title tag.
contributor: James Bond
avatar: james-bond.jpg
description: This is description of the post added in meta description tag.
tags: []
id: unique-post-id
date: {{date}}
---
{% image_fw 1.78 banner.png "ALT text of the article" %}

Add here little introduction of the post. Add at least few sentences. It can start with h2 header.

## Table of Contents
<!-- toc -->

## Header 1

Content...

## Header 2

Content...

### Header 2.1

Content 2.1

### Header 2.2

Content 2.2

etc.

...

## Summary

Here is the summary of the post. Add at least few sentences.

---
Useful examples of markdown usage inside article. Remove this content later.

### Image
{% img "your-image.jpg" "Alt title for the image" "lazy" %}

### Code highlighting
You can add any language you want, e.g. html, css, js, typescript, bash etc.
```typescript
@Component({
  selector: 'categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

}
```

### Lists

#### Type 1
First way:
* expose methods for the components in which we:
    * delegate logic execution to the core layer,
    * decide about data synchronization strategy (optimistic vs. pessimistic),
* expose streams of state for the components:
    * pick one or more streams of UI state (and combine them if necessary),
        * cache data from external API.

Second way:

- expose methods for the components in which we:
    - delegate logic execution to the core layer,
    - decide about data synchronization strategy (optimistic vs. pessimistic),
- expose streams of state for the components:
    - pick one or more streams of UI state (and combine them if necessary),
    - cache data from external API.

#### Type 2
1. expose methods for the components in which we:
    1. delegate logic execution to the core layer,
    2. decide about data synchronization strategy (optimistic vs. pessimistic),
2. expose streams of state for the components:
    1. pick one or more streams of UI state (and combine them if necessary),
    2. cache data from external API.


### Blockquote
> #### My title
> My paragraph
> - first point
> - second point

Check more on: https://www.markdownguide.org/basic-syntax/