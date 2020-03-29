let project = (import ./project.nix {});
in project.packages.mkrfuzz
