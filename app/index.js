import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from '@react-native-picker/picker';

export default function Page() {

  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [numChoices, setNumChoices] = useState(0);
  // const [numPlayers, setNumPlayers] = useState(1);

  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [quizData, setQuizData] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const resetQuiz = () => {
    setIsQuizCompleted(false);
    setIsQuizStarted(false);
    setQuizData(null);
    setAnswers({});
    setCurrentIndex(0);
    setScore(0);
    // Reset other state variables as needed
    // setNumPlayers(1);
    setNumChoices(0);
    setNumQuestions(3);
    setDifficulty("");
    setTopic("");
  };

  const handleAnswer = (questionKey, choiceKey) => {
    // Get the user's choice
    const choice = quizData[questionKey].items[choiceKey];

    // Store the user's answer
    setAnswers(prevAnswers => ({ ...prevAnswers, [questionKey]: choice }));

    // Increment the current index to move to the next question
    setCurrentIndex(prevIndex => prevIndex + 1);

    // Programmatically move the Swiper to the next slide
    // swiperRef.current.scrollBy(1);
  };

  useEffect(() => {
    if (quizData && currentIndex === Object.keys(quizData).length) {
      const calculatedScore = Object.keys(answers).reduce((score, questionKey) => {
        if (answers[questionKey] === quizData[questionKey].quizAnswer) {
          return score + 1;
        } else {
          return score;
        }
      }, 0);
      setScore(calculatedScore);
      setIsQuizCompleted(true);
    }
  }, [currentIndex, answers, quizData]);

  const sendMessage = async () => {
    try {
      console.log(`running `)

      const prompt1 = `Create a ${difficulty} difficulty quiz about ${topic} with ${numQuestions} questions. Each question should have ${numChoices} multiple choice answers.`;
      const prompt2 = `Provide a valid JSON string. You MUST format the response in a valid object, this is the exact object example you should use: ${prompt3}`
      const prompt3 = `{
        "question1": {
            "items": {
                "A": "Hunger",
                "B": "Fear",
                "C": "Boredom"
            },
            "quizAnswer": "Boredom",
            "quizQuestion": "What is a common reason for a dog to be destructive when left alone?"
        },
        "question2": {
            "items": {
                "A": "Daily",
                "B": "Weekly",
                "C": "Every 2 to 3 months"
            },
            "quizAnswer": "Every 2 to 3 months",
            "quizQuestion": "How often should a dog be bathed?"
        },
        "question3": {
            "items": {
                "A": "Physical punishment",
                "B": "Ignoring bad behavior",
                "C": "Positive reinforcement"
            },
            "quizAnswer": "Positive reinforcement",
            "quizQuestion": "What is the best way to train a dog?"
        }
    }`

      const response = await fetch('http://localhost:4000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'TESTKEY', // replace with actual API key
        },
        body: JSON.stringify({
          question: `${prompt1} ${prompt2}`,
          context: 'Quiz generation',
        }),
      })

      const data = await response.json();
      console.log(JSON.parse(data.response));
      setQuizData(JSON.parse(data.response))
    } catch (error) {
      console.error('Request failed', error);
    } finally {
      return 'done'; // Indicate that the async operation is complete
    }
  }

  const handleQuizCreation = async () => {
    setIsLoading(true); // Set loading state to true when loading starts
    try {
      // Use prompt 3 for testing
      await sendMessage();
    } catch (error) {
      console.error('Request failed', error);
    } finally {
      setIsLoading(false); // Ensure loading state is set to false even if there's an error
      setIsQuizStarted(true);
    }
  }

  return (
    <ScrollView style={styles.container} bounces={true}>
      {isLoading ?
        <ActivityIndicator size="large" color="#0000ff" />
        :
        <View>
          {isQuizCompleted && (
            <View>
              <Text style={styles.title}>Quiz Completed!</Text>
              <Text style={styles.subtitle}>Your score: {score}</Text>
              <Text style={styles.subtitle}>Here are your answers:</Text>
              {Object.keys(answers).map(questionKey => (
                <View key={questionKey}>
                  <Text style={styles.text}>{quizData[questionKey].quizQuestion}</Text>
                  <Text style={styles.text}>Your answer: {answers[questionKey]}</Text>
                  <Text style={styles.text}>Correct answer: {quizData[questionKey].quizAnswer}</Text>
                </View>
              ))}
              <Button
                title="Try Again"
                onPress={resetQuiz}
              />
            </View>
          )}

          {!isQuizCompleted && isQuizStarted && (
            <View>
              {quizData && Object.keys(quizData).map((questionKey, index) => {
                const question = quizData[questionKey];
                if (currentIndex === index) {
                  return (
                    <View key={index} style={styles.slide}>
                      <Text style={styles.text}>{question.quizQuestion}</Text>
                      {Object.keys(question.items).map(choiceKey => {
                        const choice = question.items[choiceKey];
                        if (typeof choice === 'string') {
                          return (
                            <Button
                              key={choiceKey}
                              title={choice}
                              onPress={() => handleAnswer(questionKey, choiceKey)}
                            />
                          );
                        } else {
                          return null;
                        }
                      })}
                    </View>
                  );
                } else {
                  return null;
                }
              })}
            </View>
          )}

          {!isQuizCompleted && !isQuizStarted && (
            <View>
              <Text style={styles.title}>Quiz Generator</Text>
              <Text style={styles.subtitle}>Please fill in the quiz parameters.</Text>

              <View style={styles.form}>
                <Text style={styles.label}>Quiz topic</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Topic"
                  onChangeText={setTopic}
                />

                <Text style={styles.label}>Difficulty</Text>
                <Picker
                  selectedValue={difficulty}
                  onValueChange={setDifficulty}
                  style={styles.picker}
                >
                  <Picker.Item label="Easy" value="easy" />
                  <Picker.Item label="Medium" value="medium" />
                  <Picker.Item label="Hard" value="hard" />
                  <Picker.Item label="Extreme" value="extremely hard" />
                </Picker>

                <Text style={styles.label}>Number of questions</Text>
                <Picker
                  selectedValue={numQuestions}
                  onValueChange={setNumQuestions}
                  style={styles.picker}
                >
                  <Picker.Item label="3" value={3} />
                  <Picker.Item label="4" value={4} />
                  <Picker.Item label="5" value={5} />
                  <Picker.Item label="6" value={6} />
                  <Picker.Item label="7" value={7} />
                  <Picker.Item label="8" value={8} />
                  <Picker.Item label="9" value={9} />
                  <Picker.Item label="10" value={10} />
                </Picker>

                <Text style={styles.label}>Number of choices</Text>
                <Picker
                  selectedValue={numChoices}
                  onValueChange={setNumChoices}
                  style={styles.picker}
                >
                  <Picker.Item label="2" value={2} />
                  <Picker.Item label="3" value={3} />
                  <Picker.Item label="4" value={4} />
                </Picker>

                <Button
                  onPress={handleQuizCreation}
                  title="Create Quiz"
                />

              </View>
            </View>
          )}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 160,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#38434D",
    marginBottom: 30,
  },
  form: {
    width: '100%',
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 120,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
  },
  picker: {
    margin: 0,
    padding: 0,
  },

  // swiper 

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});