name: 🐞 Bug report
description: Report a bug or an issue.
title: 'bug: '
labels: ['Bug report']
body:
  - type: markdown
    attributes:
      value: |
        # Revenge bug report

        Before creating a new bug report, please keep the following in mind:

        - **Do not submit a duplicate bug report**: Search for existing bug reports [here](https://github.com/revenge-mod/revenge-bundle/issues?q=label%3A%22Bug+report%22).
        - **Review the contribution guidelines**: Make sure your bug report adheres to it. You can find the guidelines [here](https://github.com/revenge-mod/revenge-bundle/blob/main/CONTRIBUTING.md).
        - **Do not use the issue page for support**: If you need help or have questions, join us on [Discord](https://discord.gg/ddcQf3s2Uq).
  - type: textarea
    attributes:
      label: Bug description
      description: |
        - Describe your bug in detail
        - Add steps to reproduce the bug if possible (Step 1. ... Step 2. ...)
        - Add images and videos if possible
    validations:
      required: true
  - type: textarea
    attributes:
      label: Stack trace
      description: If this bug causes a JS crash, please paste the stack trace here.
      render: shell
  - type: textarea
    attributes:
      label: Component stack trace
      description: If this bug causes a JS crash, please paste the component stack trace here.
      render: shell
  - type: textarea
    attributes:
      label: Native crash trace
      description: If this bug causes a native crash, please paste the crash trace here. On Android, this can be accessed by doing `logcat | grep AndroidRuntime`.
      render: shell
  - type: textarea
    attributes:
      label: Solution
      description: If applicable, add a possible solution to the bug.
  - type: textarea
    attributes:
      label: Additional context
      description: Add additional context here.
  - type: checkboxes
    id: acknowledgements
    attributes:
      label: Acknowledgements
      description: Your bug report will be closed if you don't follow the checklist below.
      options:
        - label: I have checked all open and closed bug reports and this is not a duplicate.
          required: true
        - label: I have chosen an appropriate title.
          required: true
        - label: All requested information has been provided properly.
          required: true
