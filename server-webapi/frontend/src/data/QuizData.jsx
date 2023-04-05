//	quizData: Array[Object]{
//		name: String,
//		questions: Array[Object]{
//			question: String
//			questionType: Int
//				- 0: 4 Options Selection
//				- 1: 2 Options Selection
//			hint: String
//			options: Array[String]
//				- Size differs based on 'questionType'
//			score: Int
//				- 0 >= x
//			timeMinute: Int
//				- 0 >= x >= 59
//			timeSeconds: Int
//				- 0 >= x >= 59
//			correctAns: Int
//				- Value is position of right answer in 'options'
//		}
//	}

export var quizData = [
	{
		quizid: "1234-1234-1234-1234",
		name: "Test Quiz",
		questions: [
			{
				question: "1 + 1 = ?",
				questionType: 0,
				hint: "Pineapple deserves to be on pizzas",
				options: [
					"2 pineapples", 
					"2",
					"2 pancakes",
					"1 potato & 1 tomato"
				],
				score: 1000,
				timeMinutes: 0,
				timeSeconds: 15,
				correctAns: 1
			},
			{
				question: "? = 10",
				questionType: 0,
				hint: "On and off",
				options: [
					"1 + 1",
					"2 + 5",
					"299792458 - 299792438",
					"3.141592653589 + [(22 / 7) * 2]"
				],
				score: 1000,
				timeMinutes: 0,
				timeSeconds: 15,
				correctAns: 0
			},
			{
				question: "Are you alive?",
				questionType: 1,
				hint: "Very philosophical...",
				options: [
					"Yes",
					"No"
				],
				score: 1000,
				timeMinutes: 0,
				timeSeconds: 15,
				correctAns: 0
			}
		]
	}
];
