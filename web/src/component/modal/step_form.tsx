import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'flex-start'
        },
        left: {
            flex: 0
        },
        right: {
            marginLeft: theme.spacing(2),
            flex: 1
        },
        steps: {
            borderRadius: 4,
            width: 300,
        },
        button: {
            marginTop: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        resetContainer: {
            paddingLeft: theme.spacing(3),
            paddingBottom: theme.spacing(3),
        },
    }),
);


export default (props: {
    children: any,
    steps: { name: string, description: string }[],
    step: number,
    canNext: boolean,
    onChange: (step: number) => void
}) => {
    const classes = useStyles();

    const handleNext = () => {
        props.onChange(props.step + 1)
    };

    const handleBack = () => {
        props.onChange(props.step - 1)
    };

    const handleReset = () => {
        props.onChange(0)
    };

    return (
        <Box className={classes.root}>
            <Paper className={classes.left} elevation={3}>
                <Stepper className={classes.steps} activeStep={props.step} orientation="vertical">
                    {props.steps.map((step, index) => (
                        <Step key={step.name}>
                            <StepLabel><Typography>{step.name}</Typography></StepLabel>
                            <StepContent>
                                <Typography variant="body2">{step.description}</Typography>
                                <div>
                                    <Button
                                        disabled={props.step === 0}
                                        onClick={handleBack}
                                        className={classes.button}
                                    >
                                        返回
                                    </Button>
                                    <Button
                                        disabled={!props.canNext}
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                        className={classes.button}
                                    >
                                        {props.step === props.steps.length - 1 ? '完成' : '下一步'}
                                    </Button>
                                </div>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
                {props.step === props.steps.length && (
                    <Paper square elevation={0} className={classes.resetContainer}>
                        <Button variant="contained" color="default" onClick={handleReset} className={classes.button}>
                            重新开始
                        </Button>
                    </Paper>
                )}
            </Paper>
            <Box className={classes.right}>
                {props.children}</Box>
        </Box>
    );
};
