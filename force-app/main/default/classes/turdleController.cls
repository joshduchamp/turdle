public with sharing class turdleController {
    
    @AuraEnabled
    public static String makeGuess (String answer, List<String> guessList){
        List<String> answerLetters = answer.toUpperCase().split('');
        List<String> invalidLetters = new List<String>();
        List<String> validLetters = new List<String>();
        Map<Integer,String> matches = new Map<Integer,String>();
        Map<Integer,List<String>> badMatches = new Map<Integer,List<String>>();
        
        for(String guess : guessList) {
            List<String> guessLetters = guess.toUpperCase().split('');
            for(Integer i = 0; i < guessLetters.size(); i++) {
                String answerChar = answerLetters[i];
                String guessChar = guessLetters[i];
                if (answerChar == guessChar) {
                    matches.put(i,guessChar);
                } else {
                    if (badMatches.containsKey(i)) {
                        badMatches.get(i).add(guessChar);
                    } else {
                        badMatches.put(i, new List<String> { guessChar });
                    }
                }
                if (answerLetters.contains(guessChar)) {
                    validLetters.add(guessChar);
                } else {
                    invalidLetters.add(guessChar);
                }
            }
        }

        List<Word__c> wordObjList = [select Name, Weight__c from Word__c];
        String nextGuess = null;
        while(wordObjList.size() > 0) {
            Integer index = Math.floor(Math.random()*wordObjList.size()).intValue();
            Word__c wordObj = wordObjList.get(index);
            wordObjList.remove(index);
            List<String> wordLetters = wordObj.Name.toUpperCase().split('');
            Boolean badMatch = false;
            for(Integer i = 0; i < wordLetters.size(); i++) {
                String wordChar = wordLetters[i];
                if (matches.containsKey(i) && matches.get(i) != wordChar) {
                    badMatch = true;
                    break;
                }
                if (badMatches.containsKey(i)) {
                    for (String badChar : badMatches.get(i)) {
                        if (badChar == wordChar) {
                            badMatch = true;
                            break;
                        }
                    }
                }
                if (invalidLetters.contains(wordChar)) {
                    badMatch = true;
                    break;
                }
            }
            for (String validChar : validLetters) {
                if (!wordLetters.contains(validChar)) {
                    badMatch = true;
                    break;
                }
            }
            if (!badMatch) {
                nextGuess = wordObj.Name;
                break;
            }
        }
        return nextGuess;
    }
}
