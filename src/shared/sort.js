export default {
    alphabetically(alpha, beta) {
        if (alpha.name < beta.name) {
            return -1;
        }
        if (alpha.name > beta.name) {
            return 1;
        }

        return 0;
    }
}
