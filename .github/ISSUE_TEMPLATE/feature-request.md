name: ⭐ Feature request
description: Create a detailed request for a new feature.
title: 'feat: '
labels: ['Feature request']
body:
  - type: markdown
    attributes:
      value: |
        # Revenge feature request

        Before creating a new feature request, please keep the following in mind:

        - **Do not submit a duplicate feature request**: Search for existing feature requests [here](https://github.com/revenge-mod/revenge-bundle/issues?q=label%3A%22Feature+request%22).
        - **Review the contribution guidelines**: Make sure your feature request adheres to it. You can find the guidelines [here](https://github.com/revenge-mod/revenge-bundle/blob/main/CONTRIBUTING.md).
        - **Do not use the issue page for support**: If you need help or have questions, join us on [Discord](https://discord.gg/ddcQf3s2Uq).
  - type: textarea
    attributes:
      label: Feature description
      description: |
        - Describe your feature in detail
        - Add images, videos, links, examples, references, etc. if possible
  - type: textarea
    attributes:
      label: Motivation
      description: |
        A strong motivation is necessary for a feature request to be considered.
        
        - Why should this feature be implemented? 
        - What is the explicit use case?
        - What are the benefits?
        - What makes this feature important?
    validations:
      required: true
  - type: checkboxes
    id: acknowledgements
    attributes:
      label: Acknowledgements
      description: Your feature request will be closed if you don't follow the checklist below.
      options:
        - label: I have checked all open and closed feature requests and this is not a duplicate
          required: true
        - label: I have chosen an appropriate title.
          required: true
        - label: All requested information has been provided properly.
          required: true
