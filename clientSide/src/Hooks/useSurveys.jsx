/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";

const useSurveys = () => {
    const [sortedSurveys, setSortedSurveys] = useState([]);
    const [latest, setLatest] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // fetch('surveys.json')
        fetch('https://surveyhubserver.vercel.app/surveys')
        .then(res => res.json())
        .then(data => {
            setSurveys(data);
            // Most voted surveys filter
            const surveysWithTotalVotes = data.map(survey => {
                const totalVotes = Object.values(survey.options).reduce((sum, value) => sum + value, 0);
                return { ...survey, totalVotes };
            });
            setSortedSurveys(surveysWithTotalVotes);
            const sortedSurveys = surveysWithTotalVotes.sort((a, b) => b.totalVotes - a.totalVotes);
            const mostVotedSurveys = sortedSurveys.slice(0, 6);
            setFeatured(mostVotedSurveys);
            // Latest surveys filter
            const sortedSurveys2 = surveysWithTotalVotes.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            const latestSurveys = sortedSurveys2.slice(0, 6);
            setLatest(latestSurveys);
            setLoading(false);
        })
    }, []); 
    return [surveys, loading, featured, latest]
};

export default useSurveys;