package com.datatecsolution.eprofe.spring_api.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class NameParserUtils {

    private static final List<String> SPECIAL_TOKENS = Arrays.asList(
            "da", "de", "del", "la", "las", "los", "mac", "mc", "van", "von", "y", "position", "san", "santa");

    public static class NameParts {
        public String firstName;
        public String lastName;

        public NameParts(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }

    public static NameParts parseFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return new NameParts("", "");
        }

        String[] tokens = fullName.trim().split("\\s+");
        List<String> names = new ArrayList<>();
        String prev = "";

        for (String token : tokens) {
            String lowerToken = token.toLowerCase();
            if (SPECIAL_TOKENS.contains(lowerToken)) {
                prev += token + " ";
            } else {
                names.add(prev + token);
                prev = "";
            }
        }

        // Add any remaining previous part (edge case)
        if (!prev.isEmpty()) {
            names.add(prev.trim());
        }

        String firstName = "";
        String lastName = "";
        int numNombres = names.size();

        switch (numNombres) {
            case 0:
                break;
            case 1:
                firstName = names.get(0);
                break;
            case 2:
                firstName = names.get(0);
                lastName = names.get(1);
                break;
            case 3:
                firstName = names.get(0) + " " + names.get(1);
                lastName = names.get(2);
                break;
            default:
                firstName = names.get(0) + " " + names.get(1);
                // Remove first two names to join the rest as last name
                List<String> lastNamesList = names.subList(2, names.size());
                lastName = String.join(" ", lastNamesList);
                break;
        }

        return new NameParts(toTitleCase(firstName), toTitleCase(lastName));
    }

    private static String toTitleCase(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        StringBuilder titleCase = new StringBuilder();
        boolean nextTitleCase = true;

        for (char c : input.toCharArray()) {
            if (Character.isSpaceChar(c)) {
                nextTitleCase = true;
            } else if (nextTitleCase) {
                c = Character.toTitleCase(c);
                nextTitleCase = false;
            } else {
                c = Character.toLowerCase(c);
            }
            titleCase.append(c);
        }

        return titleCase.toString();
    }
}
